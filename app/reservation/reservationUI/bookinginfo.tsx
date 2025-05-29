"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState, useEffect, memo, useRef } from "react"
import { useRegion, useTheather, useMovieRunningDetail, useReduxBoxoffice } from "@/app/redux/reduxService"
import { cancelOrder, requestPayment, checkPaymentStatus } from "@/src/components/common/apiService"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import axios from "@/lib/axios-config";
import { TICKET_PRICE } from "@/src/components/common/theaterData"
import { useRouter } from "next/navigation"

interface BookingInfoProps {
  setMemoActiveStep: (id: number) => void
  setMemoBookingState: (value: boolean) => void
  movie: number
  cinema: { region: number; theather: number }
  screen: number
  seats: number[]
  date: string
}

const BookingInfo: React.FC<BookingInfoProps> = ({
  setMemoActiveStep,
  setMemoBookingState,
  movie,
  cinema,
  screen,
  seats,
  date,
}) => {
  const { findMovie_id } = useReduxBoxoffice()
  const { movieRunningDetail, findStartTime, updateMovieRunningDetail } = useMovieRunningDetail()
  const { findTheaterId } = useTheather()
  const { findRegion } = useRegion()
  const router = useRouter()

  type MovieInfo = {
    title: string
    posterImage: string
    director: string
    genres: string
    runtime: number
  }
  const defaultMovie = {
    title: "영화를 선택해주세요.",
    posterImage: "/error.png",
    director: "영화를 선택해주세요.",
    genres: "영화를 선택해주세요.",
    runtime: 0,
  }
  const getMovie = () => {
    const m = findMovie_id(movie)
    if (m === undefined) return defaultMovie
    return {
      title: m.title,
      posterImage: m?.posterImage,
      director: m.director,
      genres: m.genres,
      runtime: m.runtime,
    }
  }
  const [movieInfo, setMovieInfo] = useState<MovieInfo>(getMovie())
  // 상태 변수 추가 (MovieInfo 타입 정의 아래에 추가)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [theatherInfo, setTheatherInfo] = useState<string>("영화관을 선택해 주세요.")
  const [regionInfo, setRegionInfo] = useState<string>("지역을 선택해 주세요.")
  const [startTimeIndex, setStartTimeIndex] = useState<number>(-1)
  // 좌석 정보를 로컬 스토리지에서 가져오는 로직 추가
  const [seatPositions, setSeatPositions] = useState<{ id: number; position: string }[]>([])
  const [paymentStarted, setPaymentStarted] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const paymentWindowRef = useRef<Window | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 좌석 ID를 좌석 위치(A1, B3, C2 등)로 변환하는 함수 추가
  const convertSeatIdToPosition = (seatId: number): string => {
    // 좌석 ID를 기반으로 행(A, B, C...)과 열(1, 2, 3...)을 계산
    // 이 로직은 실제 좌석 배치에 맞게 조정
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

    // 예시 로직: 각 행에 10개의 좌석이 있다고 가정
    const rowIndex = Math.floor((seatId - 1) / 10)
    const colIndex = ((seatId - 1) % 10) + 1

    // 행 인덱스가 유효한지 확인
    if (rowIndex >= 0 && rowIndex < rows.length) {
      return `${rows[rowIndex]}${colIndex}`
    }

    // 변환할 수 없는 경우 원래 ID 반환
    return `좌석 ${seatId}`
  }

  // 좌석 위치를 정렬하는 함수 추가 (convertSeatIdToPosition 함수 아래에 추가)
  const sortSeatPositions = (positions: { id: number; position: string }[]): { id: number; position: string }[] => {
    return [...positions].sort((a, b) => {
      // 행(알파벳) 추출
      const rowA = a.position.charAt(0)
      const rowB = b.position.charAt(0)

      // 먼저 행(알파벳)으로 정렬
      if (rowA !== rowB) {
        return rowA.localeCompare(rowB)
      }

      // 행이 같으면 열(숫자)로 정렬
      const colA = Number.parseInt(a.position.substring(1))
      const colB = Number.parseInt(b.position.substring(1))
      return colA - colB
    })
  }

  // 결제 상태 확인 함수 수정
  const checkPaymentCompletion = async (orderId: number) => {
    try {
      console.log("bookinginfo - checkPaymentCompletion 실행 중, 결제 창 상태 확인...")

      // 결제 창이 닫혔는지 확인
      const isPaymentWindowClosed = paymentWindowRef.current ? paymentWindowRef.current.closed : true
      console.log("결제 창 닫힘 상태:", isPaymentWindowClosed)

      if (isPaymentWindowClosed) {
        console.log("결제 창이 닫혔습니다. 결제 상태 확인 중...")

        // 결제 상태 확인 API 호출
        try {
          const result = await checkPaymentStatus(orderId)
          console.log("결제 상태 확인 결과:", result)

          if (result.success) {
            // 결제 성공 - status가 "PAID"인 경우
            console.log("결제가 성공적으로 완료되었습니다.")
            localStorage.setItem("paymentSuccess", "true")
            setPaymentSuccess(true)

            // 주문 정보가 있으면 저장
            if (result.orderData) {
              localStorage.setItem("lastCompletedOrder", JSON.stringify(result.orderData))
            }

            // 인터벌 정리
            if (checkIntervalRef.current) {
              console.log("결제 성공으로 인터벌 정리")
              clearInterval(checkIntervalRef.current)
              checkIntervalRef.current = null
            }
          } else {
            // 결제 실패 또는 취소
            console.log("결제가 완료되지 않았습니다. 상태:", result.status)
            setPaymentFailed(true)

            // 인터벌 정리
            if (checkIntervalRef.current) {
              console.log("결제 실패로 인터벌 정리")
              clearInterval(checkIntervalRef.current)
              checkIntervalRef.current = null
            }
          }
        } catch (error) {
          console.error("결제 상태 확인 중 오류:", error)
          setPaymentFailed(true)
          setError("결제 상태를 확인할 수 없습니다. 결제가 완료되지 않은 것으로 처리됩니다.")

          // 인터벌 정리
          if (checkIntervalRef.current) {
            console.log("오류 발생으로 인터벌 정리")
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
        }
      } else {
        console.log("결제 창이 아직 열려있습니다. 계속 대기합니다.")
      }
    } catch (error) {
      console.error("결제 상태 확인 중 오류:", error)
      setPaymentFailed(true)
      setError("결제 처리 중 오류가 발생했습니다.")

      // 인터벌 정리
      if (checkIntervalRef.current) {
        console.log("오류 발생으로 인터벌 정리")
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }

  useEffect(() => {
    setMovieInfo(getMovie())
    const theather = findTheaterId(cinema.theather)
    setTheatherInfo(theather?.name || "영화관을 선택해 주세요.")
    const region = findRegion(cinema.region)
    setRegionInfo(region[0]?.name || "지역을 선택해 주세요.")

    // if (movieRunningDetail != undefined) {
    const index = findStartTime(screen)
    setStartTimeIndex(index)
    // }

    console.log(movieInfo)
  }, [movie]) // movie가 변경될 때마다 실행

  // useEffect 추가
  useEffect(() => {
    // 로컬 스토리지에서 좌석 위치 정보 가져오기
    const storedPositions = localStorage.getItem("selectedSeatPositions")
    if (storedPositions) {
      try {
        const positions = JSON.parse(storedPositions)
        setSeatPositions(positions)
      } catch (e) {
        console.error("좌석 위치 정보 파싱 오류:", e)
      }
    }
  }, [])

  // useEffect 추가 (좌석 정보 가져오는 useEffect 아래에 추가)
  useEffect(() => {
    // 좌석 수에 따른 결제 금액 계산
    if (seats.length > 0) {
      // 단일 가격 적용
      const price = TICKET_PRICE

      // 총 결제 금액 계산 (좌석 수 × 티켓 가격)
      setTotalPrice(seats.length * price)
    } else {
      setTotalPrice(0)
    }
  }, [seats])

  // 모달이 열릴 때 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden"

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      document.body.style.overflow = "auto"
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [])

  // 초기화 버튼 클릭 핸들러 수정
  const handleReset = async () => {
    // 결제 진행 중인 경우 초기화 방지
    if (paymentStarted) {
      return
    }

    console.log("초기화 버튼 클릭됨")
    try {
      setLoading(true)
      setError("")

      // 로컬 스토리지에서 주문 ID 가져오기
      const orderId = localStorage.getItem("currentOrderId")
      console.log("초기화 - 로컬 스토리지에서 가져온 주문 ID:", orderId)

      if (orderId) {
        console.log("주문 취소 요청 시작, 주문 ID:", orderId)

        try {
          // 주문 취소 API 호출
          console.log("cancelOrder 함수 호출 직전")
          const result = await cancelOrder(Number(orderId))
          console.log("주문 취소 완료, 응답:", result)
        } catch (cancelError) {
          console.error("주문 취소 API 오류:", cancelError)
          // API 오류가 발생해도 계속 진행
        } finally {
          // 로컬 스토리지에서 주문 ID 제거
          localStorage.removeItem("currentOrderId")
          console.log("로컬 스토리지에서 주문 ID 제거됨")
        }
      } else {
        console.log("주문 ID가 없어 취소 요청을 보내지 않음")
      }

      // 상태 초기화 및 첫 단계로 이동
      updateMovieRunningDetail(undefined)
      setMemoActiveStep(-1)
      setMemoBookingState(false)
      console.log("상태 초기화 및 첫 단계로 이동 완료")
    } catch (error) {
      console.error("주문 취소 중 오류 발생:", error)
      setError("주문 취소 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 취소 버튼 클릭 핸들러 수정
  const handleCancel = async () => {
    // 결제 진행 중인 경우 취소 방지
    if (paymentStarted) {
      return
    }

    console.log("취소 버튼 클릭됨")
    try {
      setLoading(true)
      setError("")

      // 로컬 스토리지에서 주문 ID 가져오기
      const orderId = localStorage.getItem("currentOrderId")
      console.log("취소 - 로컬 스토리지에서 가져온 주문 ID:", orderId)

      if (orderId) {
        console.log("주문 취소 요청 시작, 주문 ID:", orderId)

        try {
          // 주문 취소 API 호출
          console.log("cancelOrder 함수 호출 직전")
          const result = await cancelOrder(Number(orderId))
          console.log("주문 취소 완료, 응답:", result)

          // 로컬 스토리지에서 주문 ID 제거
          localStorage.removeItem("currentOrderId")
          console.log("로컬 스토리지에서 주문 ID 제거됨")

          // 좌석 선택 단계로 돌아가기
          setMemoActiveStep(2)
          setMemoBookingState(false)
          console.log("좌석 선택 단계로 돌아가기 완료")
        } catch (cancelError) {
          console.error("주문 취소 API 오류:", cancelError)

          if (axios.isAxiosError(cancelError)) {
            console.error("상세 오류 응답:", cancelError.response?.data)
            console.error("상태 코드:", cancelError.response?.status)
            console.error("헤더:", cancelError.response?.headers)
          }

          // API 오류가 발생해도 UI는 이전 단계로 돌아가도록 처리
          setError("주문 취소 API 오류가 발생했지만, 좌석 선택 화면으로 돌아갑니다.")
          localStorage.removeItem("currentOrderId")

          setTimeout(() => {
            setMemoActiveStep(2)
            setMemoBookingState(false)
          }, 1500)
        }
      } else {
        // 주문 ID가 없는 경우 바로 이전 단계로 이동
        console.log("주문 ID가 없어 바로 이전 단계로 이동")
        setMemoActiveStep(2)
        setMemoBookingState(false)
      }
    } catch (error) {
      console.error("주문 취소 중 오류 발생:", error)
      setError("주문 취소 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 결제하기 버튼 클릭 핸들러 수정
  const handlePayment = async () => {
    try {
      setLoading(true)
      setError("")

      // 로컬 스토리지에서 주문 ID 가져오기
      const orderId = localStorage.getItem("currentOrderId")
      if (!orderId) {
        throw new Error("주문 정보를 찾을 수 없습니다.")
      }

      console.log("결제 요청 시작, 주문 ID:", orderId)

      // 결제 요청 API 호출
      const paymentResponse = await requestPayment(Number(orderId))
      console.log("결제 요청 응답:", paymentResponse)

      // 카카오페이 URL 추출 시도
      let redirectUrl = null

      // 응답 구조에 따라 URL 추출 시도
      if (typeof paymentResponse === "string" && paymentResponse.includes("http")) {
        // 응답이 URL 문자열인 경우
        redirectUrl = paymentResponse
      } else if (paymentResponse && typeof paymentResponse === "object") {
        // 객체에서 URL 찾기 시도
        redirectUrl =
          paymentResponse.next_redirect_pc_url ||
          paymentResponse.redirect_url ||
          paymentResponse.payment_url ||
          paymentResponse.url
      }

      // URL이 있으면 새 탭에서 열기
      if (redirectUrl) {
        console.log("카카오페이 결제 URL 열기:", redirectUrl)

        // 결제 창 열기
        paymentWindowRef.current = window.open(redirectUrl, "_blank")
        console.log("결제 창 열림 상태:", paymentWindowRef.current ? "성공" : "실패")

        // 결제 시작 상태로 변경
        setPaymentStarted(true)

        // 기존 인터벌이 있으면 정리
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current)
          checkIntervalRef.current = null
        }

        // 결제 창 상태 확인 인터벌 설정 (3초마다)
        console.log("결제 상태 확인 인터벌 설정 (3초 간격)")
        checkIntervalRef.current = setInterval(() => {
          console.log("인터벌에서 checkPaymentCompletion 호출")
          checkPaymentCompletion(Number(orderId))
        }, 3000)

        // 5분(300초) 후에 인터벌 자동 정리 (최대 대기 시간)
        setTimeout(() => {
          if (checkIntervalRef.current) {
            console.log("최대 대기 시간(5분) 초과로 인터벌 정리")
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null

            // 아직 결제 창이 열려있고 결제가 진행 중인 경우
            if (paymentStarted && !paymentSuccess && !paymentFailed) {
              setPaymentFailed(true)
              setError("결제 시간이 초과되었습니다. 결제가 완료되었다면 마이페이지에서 예매 내역을 확인해주세요.")
            }
          }
        }, 300000) // 5분
      } else {
        console.error("결제 URL을 찾을 수 없습니다. 응답:", paymentResponse)
        throw new Error("결제 URL을 받지 못했습니다.")
      }
    } catch (error) {
      console.error("결제 요청 중 오류 발생:", error)
      setError(error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoToMain = () => {
    router.push("/")
  }

  const handleRetry = () => {
    setPaymentFailed(false)
    setPaymentStarted(false)
    setError("")
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ y: -100, opacity: 0 }} // 처음에는 위쪽에서 시작
        animate={{ y: 0, opacity: 1 }} // 아래로 내려오면서 나타남
        exit={{ y: -100, opacity: 0 }} // 닫힐 때 다시 위로 올라감
        transition={{ duration: 0.3, ease: "easeOut" }} // 부드러운 애니메이션
        className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div>
          <div className="p-4 flex items-center justify-center bg-gray-50">
            <h2 className="text-xl font-bold">예매 정보</h2>
          </div>
          <div className="h-px bg-gray-200"></div>
        </div>

        <div className="p-6 overflow-y-auto ">
          {paymentSuccess ? (
            <div className="text-center mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">결제가 완료되었습니다!</h3>
              <p className="text-gray-700 mb-6">
                예매가 성공적으로 완료되었습니다. 마이페이지에서 예매 내역을 확인할 수 있습니다.
              </p>
              <button
                onClick={handleGoToMain}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors w-full"
              >
                확인
              </button>
            </div>
          ) : paymentFailed ? (
            <div className="text-center mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-700 mb-2">결제가 완료되지 않았습니다</h3>
              <p className="text-gray-700 mb-6">
                결제가 취소되었거나 오류가 발생했습니다. 다시 시도해주세요.
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors w-full"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <img
                  src={movieInfo.posterImage || "/placeholder.svg"}
                  alt={"/error.png"}
                  width={200}
                  height={300}
                  className="w-full max-w-[200px] h-auto object-cover rounded-lg shadow"
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold">{movieInfo.title}</h3>

                <div className="h-px bg-gray-200"></div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">극장</span>
                    <span className="font-medium">{theatherInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">위치</span>
                    <span className="font-medium">{regionInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">날짜</span>
                    <span className="font-medium">{date || "날짜를 선택해주세요."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">시작 시간</span>
                    <span className="font-medium">
                      {startTimeIndex !== -1 ? movieRunningDetail?.startTimes[startTimeIndex] : "시간을 선택해주세요."}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">상영시간</span>
                    <span className="font-medium">
                      {Math.floor(Number(movieInfo.runtime) / 60)}시간 {Number(movieInfo.runtime) % 60}분
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">선택 좌석</span>
                    <div className="flex gap-2">
                      {seats.length !== 0 ? (
                        // 좌석 ID를 위치로 변환하고 정렬하여 표시
                        (() => {
                          // 좌석 ID를 위치 정보로 변환
                          const positions = seats.map((seatId) => {
                            const seatInfo = seatPositions.find((s) => s.id === seatId)
                            return {
                              id: seatId,
                              position: seatInfo ? seatInfo.position : convertSeatIdToPosition(seatId),
                            }
                          })

                          // 위치 정보를 기준으로 정렬
                          const sortedPositions = sortSeatPositions(positions)

                          // 정렬된 위치 정보를 쉼표로 구분하여 표시
                          return <span>{sortedPositions.map((p) => p.position).join(", ")}</span>
                        })()
                      ) : (
                        <span>좌석이 비었습니다.</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">인원</span>
                    <span className="font-medium">{seats.length}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">1인당 가격</span>
                    <span className="font-medium">
                      {seats.length > 0 ? (totalPrice / seats.length).toLocaleString() : 0}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">결제 금액</span>
                    <span className="font-bold text-blue-600">{totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="h-px bg-gray-200"></div>
        <div className="p-4 flex justify-end bg-gray-50">
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">
              {error}
            </div>
          )}

          {paymentStarted ? (
            <div className="w-full text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-gray-700 mb-2">결제가 진행 중입니다.</p>
              <p className="text-sm text-gray-500 mb-4">
                카카오페이 결제 창에서 결제를 완료해주세요.
                <br />
                결제 창을 닫으면 자동으로 결제 상태가 확인됩니다.
              </p>
            </div>
          ) : paymentSuccess || paymentFailed ? (
            <></>
          ) : (
            <>
              <button
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "초기화"}
              </button>
              <button
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "취소"}
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    결제하기
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
const MemoizedBookingInfo = memo(BookingInfo)
MemoizedBookingInfo.displayName = "BookingInfo"
export default MemoizedBookingInfo

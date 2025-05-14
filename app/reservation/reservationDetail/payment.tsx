"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { requestPayment, checkPaymentStatus } from "@/src/components/common/apiService"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentProps {
  setMemoBookingState: (id: boolean) => void
}

const Payment: React.FC<PaymentProps> = ({ setMemoBookingState }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStarted, setPaymentStarted] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const router = useRouter()
  const paymentWindowRef = useRef<Window | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMemoBookingState(true)

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [setMemoBookingState])

  // 결제 상태 확인 함수 수정 - 결제 창 닫힘 감지 로직 개선
  const checkPaymentCompletion = async (orderId: number) => {
    try {
      console.log("checkPaymentCompletion 실행 중, 결제 창 상태 확인...")

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
            localStorage.setItem("paymentCompleted", "true")
            setPaymentSuccess(true)

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

          // 오류 발생 시 인터벌 정리
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

      // 오류 발생 시 인터벌 정리
      if (checkIntervalRef.current) {
        console.log("오류 발생으로 인터벌 정리")
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }

  // handlePayment 함수 수정 - 결제 창 열기 및 인터벌 설정 로직 개선
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
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold mb-6">결제 진행</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-md">
          {error}
        </div>
      )}

      {paymentSuccess ? (
        <div className="text-center mb-8 p-6 bg-green-50 border border-green-200 rounded-lg w-full max-w-md">
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
        <div className="text-center mb-8 p-6 bg-red-50 border border-red-200 rounded-lg w-full max-w-md">
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
      ) : paymentStarted ? (
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-gray-700 mb-2">결제가 진행 중입니다.</p>
          <p className="text-sm text-gray-500">
            카카오페이 결제 창에서 결제를 완료해주세요.
            <br />
            결제 창을 닫으면 자동으로 결제 상태가 확인됩니다.
          </p>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-8 text-center">
            예매 정보를 확인하신 후 결제하기 버튼을 클릭하여 결제를 진행해주세요.
          </p>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                결제 처리 중...
              </>
            ) : (
              "결제하기"
            )}
          </button>

          <p className="text-sm text-gray-500 mt-4">결제는 카카오페이를 통해 안전하게 진행됩니다.</p>
        </>
      )}
    </div>
  )
}

export default Payment

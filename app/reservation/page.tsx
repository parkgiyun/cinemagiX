"use client"

import { useCallback, useEffect, useState, lazy, Suspense } from "react"
import MemoNav from "./reservationUI/reservationNav"
import MemoizedMoive from "./reservationDetail/selectedMovie"
import { motion, AnimatePresence } from "framer-motion"
import MemoTypingText from "@/src/components/common/Animation/typingAni"
import { BufferingAni } from "@/src/components/common/Animation/motionAni"
import MemoReservationState from "./reservationUI/reservationState"
import { fetchBoxofficeGet } from "@/src/components/common/apiService"
import { useReduxBoxoffice } from "@/app/redux/reduxService"
import ScrollToTopButton from "@/src/components/common/scrollTopButton"
import MemoizedBookingInfo from "./reservationUI/bookinginfo"
import { useRouter } from "next/navigation"
import { Header } from "@/src/components/common/Header"

export default function Reservation() {
  const [activeStep, setActiveStep] = useState(0) // 현재 활성화된 단계
  const [isLoading, setIsLoading] = useState(false)
  const [BookingState, setBookingState] = useState(false)
  const text = "예매하기"
  const router = useRouter()

  // 결제 완료 상태 확인 로직 추가 (useEffect 내부)
  useEffect(() => {
    // 결제 완료 상태 확인
    const paymentCompleted = localStorage.getItem("paymentCompleted")
    const paymentSuccess = localStorage.getItem("paymentSuccess")

    if (paymentCompleted === "true" || paymentSuccess === "true") {
      // 결제 완료 상태 초기화
      localStorage.removeItem("paymentCompleted")
      localStorage.removeItem("paymentSuccess")

      // 메인 페이지로 리다이렉션
      router.push("/")
    }
  }, [router])

  // 🚨서버에서 데이터 가져오기 🚨
  const { updateMovieList } = useReduxBoxoffice()
  useEffect(() => {
    const controller = new AbortController()

    const fetchMovieList = async () => {
      try {
        const data = await fetchBoxofficeGet()
        updateMovieList(data)
      } catch (error) {
        controller.abort()
        console.error(error)
        updateMovieList([])
      }
    }

    fetchMovieList()
  }, [])
  // 🚨서버에서 데이터 가져오기 🚨

  // 결제에 필요한 state 변수.
  const [movie, setMovie] = useState(-1)
  const [cinema, setCinema] = useState<{ region: number; theather: number }>({
    region: -1,
    theather: -1,
  })
  const [date, setDate] = useState<string>("")
  const [screen, setScreen] = useState<number>(-1)
  const [seats, setSeats] = useState<number[]>([])

  const setMemoBookingState = useCallback((id: boolean) => {
    setBookingState(id)
  }, [])

  const setMemoActiveStep = useCallback((id: number) => {
    setActiveStep(id)
  }, [])

  const setMemoMovie = useCallback((id: number) => {
    setMovie(id)
  }, [])

  const setMemoCinema = useCallback((region: number, theather: number) => {
    setCinema({ region, theather })
  }, [])

  const setMemoDate = useCallback((dateStr: string) => {
    setDate(dateStr)
  }, [])

  const setMemoScreen = useCallback((screenId: number) => {
    setScreen(screenId)
  }, [])

  const setMemoSeats = useCallback((seatsArray: number[]) => {
    setSeats(seatsArray)
  }, [])

  //const MemoMovie = lazy(() => import("./reservationDetail/selectedMovie"));
  const MemoTheather = lazy(() => import("./reservationDetail/CinemaComponents/selectedTheater"))
  const MemoSeat = lazy(() => import("./reservationDetail/selectedSeat"))
  const MemoPayment = lazy(() => import("./reservationDetail/payment"))
  const MemoInfo = lazy(() => import("./reservationUI/bookinginfo"))
  //const MemoNav = lazy(() => import("./reservationUI/reservationNav"));

  // 로컬 스토리지에서 선택한 영화 ID를 가져와 자동 선택
  useEffect(() => {
    const selectedMovieId = localStorage.getItem("selectedMovieId")
    if (selectedMovieId) {
      const movieId = Number.parseInt(selectedMovieId)
      setMemoMovie(movieId)
      setMovie(movieId)
      // 영화 선택 후 자동으로 다음 단계로 이동
      setMemoActiveStep(1)
      // 사용 후 로컬 스토리지에서 제거 (중복 선택 방지)
      localStorage.removeItem("selectedMovieId")
    }
  }, [setMemoMovie, setMemoActiveStep])

  // 🚨activeStep의 값변화에 따른 UI 관리: 경우의 수는 0,1,2,3 🚨
  useEffect(() => {
    const resetState = () => {
      setMovie(-1)
      setCinema({ region: -1, theather: -1 })
      setDate("")
      setScreen(-1)
      setSeats([])
      setActiveStep(0)
    }
    const loading = () => {
      if (activeStep === -1) {
        resetState()
        return
      }
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 600)
      return () => clearTimeout(timer)
    }
    loading()
  }, [activeStep])
  // 🚨activeStep의 값변화에 따른 UI 관리. 🚨

  const steps = () => {
    switch (activeStep) {
      case 0:
        return <MemoizedMoive setMemoActiveStep={setMemoActiveStep} setMemoMovie={setMemoMovie} />
      case 1:
        return (
          <MemoTheather
            setMemoActiveStep={setMemoActiveStep}
            setMemoCinema={setMemoCinema}
            setMemoDate={setMemoDate}
            setMemoMoive={setMemoMovie}
            setMemoScreen={setMemoScreen}
          />
        )
      case 2:
        return <MemoSeat setMemoActiveStep={setMemoActiveStep} setMemoSeats={setMemoSeats} screen={screen} />
      case 3:
        return <MemoPayment setMemoBookingState={setMemoBookingState} />
      default:
        return <div>error</div>
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* 공통 헤더 사용 */}
        <Header activePage="reservation" />

        {/* 예매 페이지 컨테이너 너비 확장 */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
          <MemoNav activeStep={activeStep} setActiveStep={setMemoActiveStep}></MemoNav>

          <main className="bg-white rounded-lg shadow-md mt-6">
            <div className="p-6">
              <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  <MemoTypingText text={text} className="text-2xl font-bold text-gray-900" />
                </h1>
              </header>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <BufferingAni className={"translate-y-23"}></BufferingAni>
                ) : (
                  <div>
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <Suspense
                        fallback={
                          <div className="flex justify-center items-center py-20">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        }
                      >
                        {steps()}
                      </Suspense>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>

        <MemoReservationState activeStep={activeStep} setMemoBookingState={setMemoBookingState}></MemoReservationState>
        {BookingState ? (
          <MemoizedBookingInfo
            setMemoActiveStep={setMemoActiveStep}
            setMemoBookingState={setMemoBookingState}
            movie={movie}
            cinema={cinema}
            screen={screen}
            seats={seats}
            date={date}
          ></MemoizedBookingInfo>
        ) : (
          ""
        )}
        <ScrollToTopButton />
      </div>
    </>
  )
}

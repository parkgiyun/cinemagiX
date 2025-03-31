"use client"

import { useEffect, useState } from "react"
import ReservationNav from "./reservationUI/reservationNav"
import SelectedSeat from "./reservationDetail/selectedSeat"
import SelectedMovie from "./reservationDetail/selectedMovie"
import { motion, AnimatePresence } from "framer-motion"
import { TypingText } from "@/src/components/common/Animation/typingAni"
import Payment from "./reservationDetail/payment"
import { BufferingAni } from "@/src/components/common/Animation/motionAni"
import { ReservationState } from "./reservationUI/reservationState"
import SelectedTheater from "./reservationDetail/CinemaComponents/selectedTheater"
import BookingInfo from "./reservationUI/bookinginfo"
import { fetchBoxofficeGet } from "@/src/components/common/apiService"
import { useReduxBoxoffice } from "@/app/redux/reduxService"
import ScrollToTopButton from "@/src/components/common/scrollTopButton"

export default function Reservation() {
  const [activeStep, setActiveStep] = useState(0) // 현재 활성화된 단계
  const [isLoading, setIsLoading] = useState(false)
  const [BookingState, setBookingState] = useState(false)
  const text = "예매하기"

  // 🚨서버에서 데이터 가져오기 🚨
  const { updateMovieList, selectedMovie } = useReduxBoxoffice()
  const fetchMovieList = async () => {
    try {
      const data = await fetchBoxofficeGet()
      console.log(data)
      updateMovieList(data)
    } catch (error) {
      console.log(error)
      updateMovieList([])
    }
  }

  useEffect(() => {
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

  // 선택된 영화가 있으면 자동으로 영화관 선택 단계로 이동
  useEffect(() => {
    if (selectedMovie) {
      console.log("선택된 영화 정보 감지:", selectedMovie)
      setMovie(selectedMovie.id)

      // 약간의 지연 후 다음 단계로 이동 (UI 렌더링 완료 후)
      setTimeout(() => {
        setActiveStep(1)
      }, 300)
    }
  }, [selectedMovie])

  // 🚨activeStep의 값변화에 따른 UI 관리: 경우의 수는 0,1,2,3 🚨
  useEffect(() => {
    if (activeStep === -1) {
      setMovie(-1)
      setCinema({
        region: -1,
        theather: -1,
      })
      setDate("")
      setScreen(-1)
      setSeats([])
      setActiveStep(0)
      return
    }
    console.log("현재 activeStep:", activeStep)
    console.log("선택된 영화관:", cinema)
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [activeStep])
  // 🚨activeStep의 값변화에 따른 UI 관리. 🚨

  return (
    <>
      <div className="min-h-full">
        <ReservationNav activeStep={activeStep} setActiveStep={setActiveStep}></ReservationNav>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="bg-white shadow-md">
              <div className="mx-auto max-w-7xl py-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <h1 className="text-2xl font-normal text-gray-900 font-lato">
                  <TypingText text={text} className="text-2xl font-bold text-gray-900 font-lato" />
                </h1>
                <div className="flex-1 flex justify-center"></div>
              </div>
            </header>
            <AnimatePresence mode="wait">
              {isLoading ? ( // 로딩 중이면 스피너 표시
                <BufferingAni className={"translate-y-23"}></BufferingAni>
              ) : (
                <motion.div
                  key={activeStep} // key 변경 시 애니메이션 실행
                  initial={{ opacity: 0, y: 30 }} // 더 아래서 시작
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }} // 사라질 때 위로 약간 올라가며 퇴장
                  transition={{ duration: 0.5, ease: "easeInOut" }} // 더 부드러운 효과 적용
                >
                  {activeStep === 0 ? (
                    <SelectedMovie setActiveStep={setActiveStep} setMovie={setMovie} />
                  ) : activeStep === 1 ? (
                    <SelectedTheater
                      setActiveStep={setActiveStep}
                      setCinema={setCinema}
                      setMovie={setMovie}
                      setScreen={setScreen}
                      setDate={setDate}
                    />
                  ) : activeStep === 2 ? (
                    <SelectedSeat setActiveStep={setActiveStep} setSeats={setSeats} screen={screen} />
                  ) : activeStep === 3 ? (
                    <Payment setBookingState={setBookingState} />
                  ) : (
                    <div>error</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
        <ReservationState activeStep={activeStep} setBookingState={setBookingState}></ReservationState>
        {BookingState ? (
          <BookingInfo
            setActiveStep={setActiveStep}
            setBookingState={setBookingState}
            movie={movie}
            cinema={cinema}
            screen={screen}
            seats={seats}
            date={date}
          ></BookingInfo>
        ) : (
          ""
        )}
        <ScrollToTopButton />
      </div>
    </>
  )
}


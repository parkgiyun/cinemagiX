"use client"

import type React from "react"

import { useState, useEffect, useRef, memo } from "react"
import { fetchSeat, createOrder } from "@/src/components/common/apiService"
// import { Clock, Film, Ticket } from 'lucide-react';
import { Ticket } from "lucide-react"
import { BufferingAni, scrollAni } from "@/src/components/common/Animation/motionAni"
// 좌석 정보 인터페이스
import { getUserProfile } from "@/src/components/dashboard/dashboardFeatures"

export const maxSelectableSeats = 4
interface SeatData {
  seatId: number
  horizontal: string
  vertical: number
  reserved: boolean
}

interface SelectedSeatProps {
  screen: number
  setMemoSeats: (id: number[]) => void
  setMemoActiveStep: (id: number) => void
}

const SelectedSeat: React.FC<SelectedSeatProps> = ({ setMemoActiveStep, setMemoSeats, screen }) => {
  const fetchSeatData = async () => {
    const seatData = await fetchSeat(screen)
    return seatData
  }

  const [seatData, setSeatData] = useState<SeatData[]>([])
  useEffect(() => {
    fetchSeatData().then((seatData) => {
      setSeatData(seatData)
      console.log("🟢 Promise 해제됨:", seatData)
    })
  }, [])

  useEffect(() => {
    scrollAni(seatRef)
  }, [seatData])
  const [selectedSeats, setSelectedSeats] = useState<SeatData[]>([])
  const [seat_ids, setSeat_ids] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ids = selectedSeats.map((s) => {
      return s.seatId
    })
    setSeat_ids(ids)

    // 선택된 좌석 정보를 로컬 스토리지에 저장 (위치 정보 포함)
    const seatPositions = selectedSeats.map((seat) => ({
      id: seat.seatId,
      position: `${seat.horizontal.toUpperCase()}${seat.vertical}`,
    }))
    localStorage.setItem("selectedSeatPositions", JSON.stringify(seatPositions))
  }, [selectedSeats])

  const seatRef = useRef<HTMLDivElement>(null)

  // 선택 완료 처리
  const handleConfirm = async () => {
    if (selectedSeats.length === 0) {
      alert("좌석을 선택해주세요.")
      return
    }
    if (loading) return // 중복 클릭 방지
    setLoading(true)
    try {
      // 로그인 확인
      const userData = getUserProfile()
      if (!userData || !userData.user_id) {
        alert("로그인이 필요합니다.")
        return
      }

      console.log("선택된 좌석:", selectedSeats)

      // 주문 생성 API 호출
      const orderData = {
        userId: userData.user_id,
        screeningId: screen,
        seatIds: seat_ids,
      }

      console.log("주문 생성 요청 데이터:", orderData)

      const orderResponse = await createOrder(orderData)
      console.log("주문 생성 응답:", orderResponse)

      // 주문 ID를 로컬 스토리지에 저장
      if (orderResponse && orderResponse.id) {
        localStorage.setItem("currentOrderId", orderResponse.id.toString())
        console.log("주문 ID 저장됨:", orderResponse.id)

        // 주문 응답 전체를 저장 (나중에 결제 상태 확인에 사용)
        localStorage.setItem("currentOrderData", JSON.stringify(orderResponse))
      }

      // 다음 단계로 이동
      setMemoSeats(seat_ids)
      setMemoActiveStep(3)
    } catch (error) {
      console.error("주문 생성 중 오류 발생:", error)
      alert("주문 생성 중 오류 발생. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }
  const handleReSeat = () => {
    setSelectedSeats([])
  }

  // 좌석 정렬 함수 추가
  const sortSelectedSeats = (seats: SeatData[]): SeatData[] => {
    return [...seats].sort((a, b) => {
      // 먼저 행(알파벳)으로 정렬
      if (a.horizontal !== b.horizontal) {
        return a.horizontal.localeCompare(b.horizontal)
      }

      // 행이 같으면 열(숫자)로 정렬
      return a.vertical - b.vertical
    })
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">좌석 선택</h1>
      </div>

      <div
        ref={seatRef}
        className="bg-white shadow-md py-10 px flex flex-wrap items-center justify-between px-4 rounded-t-2xl"
      >
        <div>
          <p className="text-sm text-gray-600">최대 {maxSelectableSeats}석까지 선택 가능합니다.</p>
          <div className="flex items-center gap-2 text-gray-600">
            <Ticket className="w-4 h-4" />
            <span className="font-medium">선택한 좌석:</span>
            {selectedSeats.length > 0 ? (
              <span>
                {sortSelectedSeats(selectedSeats)
                  .map((seat) => `${seat.horizontal.toUpperCase()}${seat.vertical}`)
                  .join(", ")}
              </span>
            ) : (
              <span className="text-gray-400">좌석을 선택해주세요</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 text-sm border border-gray-300 rounded-md transition-colors ${
              selectedSeats.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
            onClick={handleReSeat}
            disabled={selectedSeats.length === 0}
          >
            좌석 초기화
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSeats.length > 0 && !loading
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleConfirm}
            disabled={selectedSeats.length === 0 || loading}
          >
            {loading ? "처리중..." : "선택 완료"}
          </button>
        </div>
      </div>
      {/* 선택완료 버튼 */}

      {/* 좌석 선택 */}
      <div className="bg-white  shadow-md p-6 mb-6">
        <div className="w-full mb-10 relative">
          <div className="h-8 bg-gray-300 rounded-lg w-4/5 mx-auto flex items-center justify-center text-gray-600 text-sm font-medium shadow-md transform perspective-500 rotateX-10">
            SCREEN
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-3/5 h-6 bg-gradient-to-b from-gray-200 to-transparent rounded-t-full"></div>
        </div>
        {/* 좌석 보여주는 컴포넌트 */}
        {seatData ? (
          <ViewSeat seatData={seatData} selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} />
        ) : (
          <BufferingAni className={""} />
        )}
        {/* <ViewSeat
          seatData={seatData}
          selectedSeats={selectedSeats}
          setSelectedSeats={setSelectedSeats}
        /> */}

        {/* 좌석 범례 */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-200 rounded-md mr-2"></div>
            <span>선택 가능한 좌석</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-blue-500 rounded-md mr-2"></div>
            <span>선택한 좌석</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-400 rounded-md mr-2"></div>
            <span>선택 불가능한 좌석</span>
          </div>
        </div>
      </div>
      {/* 스크린 */}
    </div>
  )
}
const MemoizedSelectedSeat = memo(SelectedSeat)
MemoizedSelectedSeat.displayName = "SelectedSeat"
export default MemoizedSelectedSeat

interface ViewSeatProps {
  seatData: SeatData[]
  selectedSeats: SeatData[]
  setSelectedSeats: React.Dispatch<React.SetStateAction<SeatData[]>>
}

const ViewSeat: React.FC<ViewSeatProps> = ({ seatData, selectedSeats, setSelectedSeats }) => {
  // 화면 크기에 따라 좌석 텍스트 표시 여부를 관리하는 상태
  // const [showSeatText, setShowSeatText] = useState(window.innerWidth >= 640)

  // 화면 크기 변경 감지
  // useEffect(() => {
  //   const handleResize = () => {
  //     setShowSeatText(window.innerWidth >= 640)
  //   }

  //   window.addEventListener("resize", handleResize)
  //   return () => window.removeEventListener("resize", handleResize)
  // }, [])
  // 좌석 데이터를 그리드 형태로 변환
  const organizeSeatsIntoGrid = () => {
    if (!seatData || seatData.length === 0) return { grid: [], rowLabels: [], colLabels: [] }

    // 모든 가능한 행(horizontal)과 열(vertical) 값 추출
    const horizontalValues = Array.from(new Set(seatData.map((seat) => seat.horizontal))).sort()
    const verticalValues = Array.from(new Set(seatData.map((seat) => seat.vertical))).sort((a, b) => a - b)

    // 빈 그리드 생성
    const grid = Array(horizontalValues.length)
      .fill(null)
      .map(() => Array(verticalValues.length).fill(null))

    // 그리드에 좌석 데이터 채우기
    seatData.forEach((seat) => {
      const rowIndex = horizontalValues.indexOf(seat.horizontal)
      const colIndex = verticalValues.indexOf(seat.vertical)

      if (rowIndex !== -1 && colIndex !== -1) {
        grid[rowIndex][colIndex] = seat
      }
    })

    return { grid, rowLabels: horizontalValues, colLabels: verticalValues }
  }

  const { grid, rowLabels, colLabels } = organizeSeatsIntoGrid()

  // 좌석 선택 처리
  const handleSeatClick = (seat: SeatData) => {
    if (seat.reserved) return // reserved: true인 좌석은 선택 불가

    //const seatKey = { row: seat.horizontal, col: seat.vertical };
    const isSeatSelected = selectedSeats.some((s) => s.vertical === seat.vertical && s.horizontal === seat.horizontal)

    if (isSeatSelected) {
      // 이미 선택된 좌석이면 선택 해제
      setSelectedSeats(selectedSeats.filter((s) => !(s.vertical === seat.vertical && s.horizontal === seat.horizontal)))
    } else {
      // 새로운 좌석 선택 (최대 선택 가능 좌석 수 확인)
      if (selectedSeats.length < maxSelectableSeats) {
        setSelectedSeats([...selectedSeats, seat])
        //setSeat_ids([...seat_ids, seat.seatId]);
      }
    }
  }

  // 좌석이 선택되었는지 확인
  const isSeatSelected = (seat: SeatData) => {
    return selectedSeats.some((s) => s.horizontal === seat.horizontal && s.vertical === seat.vertical)
  }
  // 좌석 상태에 따른 스타일 클래스 결정
  const getSeatClass = (seat: SeatData) => {
    if (!seat) return "invisible" // 좌석이 없는 경우
    if (seat.reserved) return "bg-gray-400 text-gray-200 cursor-not-allowed" // reserved: true인 좌석은 선택 불가
    if (isSeatSelected(seat)) return "bg-blue-500 text-white" // 선택된 좌석
    return "bg-gray-200 hover:bg-blue-200 text-gray-700" // 선택 가능한 좌석
  }

  if (grid.length === 0) {
    return <div className="text-center py-8">좌석 정보를 불러오는 중...</div>
  }

  return (
    <div className="mb-8 overflow-x-auto pb-4">
      <div className="min-w-[320px]">
        {/* 열 레이블 (상단) */}
        <div className="grid grid-cols-[auto_repeat(10,minmax(0,1fr))] gap-1 max-w-3xl mx-auto mb-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"></div> {/* 빈 셀 (좌상단 모서리) */}
          {colLabels.map((col, index) => (
            <div
              key={index}
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-xs sm:text-sm font-medium"
            >
              {col}
            </div>
          ))}
        </div>

        {/* 좌석 그리드 (행 레이블 포함) */}
        <div className="space-y-2">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-[auto_repeat(10,minmax(0,1fr))] gap-1 max-w-3xl mx-auto">
              {/* 행 레이블 (왼쪽) */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-xs sm:text-sm font-medium">
                {rowLabels[rowIndex].toUpperCase()}
              </div>

              {/* 좌석 */}
              {row.map((seat, colIndex) => (
                <div
                  key={colIndex}
                  className={`
                  w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-medium rounded-md cursor-pointer transition-colors
                  ${seat ? getSeatClass(seat) : "invisible"}
                `}
                  onClick={() => seat && handleSeatClick(seat)}
                >
                  {seat && `${seat.horizontal.toUpperCase()}${seat.vertical}`}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

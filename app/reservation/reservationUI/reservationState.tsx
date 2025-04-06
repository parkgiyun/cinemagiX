"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ProgressBarAni } from "@/src/components/common/Animation/motionAni"
import { memo } from "react"

interface ReservationStateProps {
  activeStep: number
  setMemoBookingState: (value: boolean) => void
}

const ReservationState: React.FC<ReservationStateProps> = ({ activeStep, setMemoBookingState }) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 border-t border-gray-200 z-20"
    >
      <div className="site-container flex justify-between items-center">
        <div className="w-full max-w-md">
          <ProgressBarAni name="예매 진행 상황" width={activeStep * 25} className=""></ProgressBarAni>
        </div>
        <button
          onClick={() => setMemoBookingState(true)}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-md ml-4"
        >
          예매 정보 확인
        </button>
      </div>
    </motion.div>
  )
}
const MemoReservationState = memo(ReservationState)
MemoReservationState.displayName = "ReservationState"
export default MemoReservationState
// {movie ? (
//   <div className="w-full md:w-3/4 lg:w-4/5 space-y-4">
//     <h2 className="text-2xl font-bold">{movie.title}</h2>

//     <div className="flex items-center gap-2 text-gray-600">
//       <Clock className="w-4 h-4" />
//       <span>{formatRuntime(movie.runtime)}</span>
//     </div>
//     {/* <div className="flex items-center gap-2 text-gray-600">
//       <MapPin className="w-4 h-4" />
//       <span>
//         {movieRunningDetail.} | {theaterDetail.location}
//       </span>
//     </div> */}

//     <div className="flex items-center gap-2 text-gray-600">
//       <Film className="w-4 h-4" />
//       <span>
//         {/* {movieRunningDetail.roomIds[selectedScreeningIndex]
//           ? `${runningDetail.roomIds[selectedScreeningIndex]}관`
//           : "정보 없음"} */}
//       </span>
//     </div>

//     {/* 선택된 좌석 정보 */}
//     <div className="mt-4">
//       <div className="flex items-center gap-2 text-gray-600">
//         <Ticket className="w-4 h-4" />
//         <span className="font-medium">선택한 좌석:</span>
//         {selectedSeats.length > 0 ? (
//           <span>
//             {selectedSeats
//               .sort((a, b) => {
//                 if (a.row !== b.row) return a.row.localeCompare(b.row);
//                 return a.col - b.col;
//               })
//               .map((seat) => `${seat.row.toUpperCase()}${seat.col}`)
//               .join(", ")}
//           </span>
//         ) : (
//           <span className="text-gray-400">좌석을 선택해주세요</span>
//         )}
//       </div>
//     </div>
//   </div>
// ) : (
//   ""
// )}

// 상영 시간을 보기 좋게 포맷팅
// const formatTime = (timeString: string) => {
//   const date = new Date(timeString);
//   return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
// };

// // 러닝타임을 시간:분 형식으로 변환
// const formatRuntime = (minutes: number | undefined) => {
//   if (minutes === undefined) return;
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   return `${hours}시간 ${mins}분`;
// };


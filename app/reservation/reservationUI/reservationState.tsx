import { motion } from "framer-motion";
import { ProgressBarAni } from "@/src/components/common/Animation/motionAni";

interface ReservationStateProps {
  activeStep: number;
  setBookingState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ReservationState: React.FC<ReservationStateProps> = ({
  activeStep,
  setBookingState,
}) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      className="z-2 fixed bottom-0 left-0 w-4/5 bg-white shadow-lg p-4 rounded-t-2xl"
    >
      <button
        title="2"
        onClick={() => setBookingState(true)}
        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md z-1"
      >
        <div className="fixed bottom-0 left-1/10 w-4/5 z-20 p-4 bg-white border-t border-gray-200 shadow-sm md:p-6 dark:bg-gray-800 dark:border-gray-600">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            <ProgressBarAni name="예매현황" width={activeStep * 25} className=""></ProgressBarAni>
          </span>
        </div>
      </button>
    </motion.div>
  );
};

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

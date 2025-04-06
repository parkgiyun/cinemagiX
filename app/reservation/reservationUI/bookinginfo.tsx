"use client";

import { motion } from "framer-motion";
import { useState, useEffect, memo } from "react";
import {
  useRegion,
  useTheather,
  useMovieRunningDetail,
  useReduxBoxoffice,
} from "@/app/redux/reduxService";

interface BookingInfoProps {
  setMemoActiveStep: (id: number) => void;
  setMemoBookingState: (value: boolean) => void;
  movie: number;
  cinema: { region: number; theather: number };
  screen: number;
  seats: number[];
  date: string;
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
  const { findMovie_id } = useReduxBoxoffice();
  const { movieRunningDetail, findStartTime, updateMovieRunningDetail } = useMovieRunningDetail();
  const { findTheaterId } = useTheather();
  const { findRegion } = useRegion();

  type MovieInfo = {
    title: string;
    posterImage: string;
    director: string;
    genres: string;
    runtime: number;
  };
  const defaultMovie = {
    title: "영화를 선택해주세요.",
    posterImage: "/error.png",
    director: "영화를 선택해주세요.",
    genres: "영화를 선택해주세요.",
    runtime: 0,
  };
  const getMovie = () => {
    const m = findMovie_id(movie);
    if (m === undefined) return defaultMovie;
    return {
      title: m.title,
      posterImage: m?.posterImage,
      director: m.director,
      genres: m.genres,
      runtime: m.runtime,
    };
  };
  const [movieInfo, setMovieInfo] = useState<MovieInfo>(getMovie());
  const [theatherInfo, setTheatherInfo] = useState<string>("영화관을 선택해 주세요.");
  const [regionInfo, setRegionInfo] = useState<string>("지역을 선택해 주세요.");
  const [startTimeIndex, setStartTimeIndex] = useState<number>(-1);
  useEffect(() => {
    setMovieInfo(getMovie());
    const theather = findTheaterId(cinema.theather);
    setTheatherInfo(theather?.name || "영화관을 선택해 주세요.");
    const region = findRegion(cinema.region);
    setRegionInfo(region[0]?.name || "지역을 선택해 주세요.");

    // if (movieRunningDetail != undefined) {
    const index = findStartTime(screen);
    setStartTimeIndex(index);
    // }

    console.log(movieInfo);
  }, [movie]); // movie가 변경될 때마다 실행

  // 모달이 열릴 때 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setMemoBookingState(false);
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }} // 처음에는 위쪽에서 시작
        animate={{ y: 0, opacity: 1 }} // 아래로 내려오면서 나타남
        exit={{ y: -100, opacity: 0 }} // 닫힐 때 다시 위로 올라감
        transition={{ duration: 0.3, ease: "easeOut" }} // 부드러운 애니메이션
        className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div>
          <div className="p-4 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-bold">예매 정보</h2>
            <button
              title="1"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setMemoBookingState(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="h-px bg-gray-200"></div>
        </div>

        <div className="p-6 overflow-y-auto ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <img
                src={movieInfo.posterImage}
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
                    {startTimeIndex !== -1
                      ? movieRunningDetail?.startTimes[startTimeIndex]
                      : "시간을 선택해주세요."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">상영시간</span>
                  <span className="font-medium">
                    {Math.floor(Number(movieInfo.runtime) / 60)}시간{" "}
                    {Number(movieInfo.runtime) % 60}분
                  </span>
                </div>

                <div className="h-px bg-gray-200 my-2"></div>

                <div className="flex justify-between">
                  <span className="text-gray-500">선택 좌석</span>
                  <div className="flex gap-2">
                    {seats.length !== 0 ? (
                      seats.map((s, i) => <span key={i}>{s}</span>)
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
                  <span className="text-gray-500">결제 금액</span>
                  {/* <span className="font-bold text-blue-600">
                {movieRunningDetail..toLocaleString()}원
              </span> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gray-200"></div>
        <div className="p-4 flex justify-end bg-gray-50">
          <button
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors mr-2"
            onClick={() => {
              updateMovieRunningDetail(undefined);
              setMemoActiveStep(-1);
              setMemoBookingState(false);
            }}
          >
            초기화
          </button>
          <button
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors mr-2"
            onClick={() => setMemoBookingState(false)}
          >
            취소
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center">
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
          </button>
        </div>
      </motion.div>
    </div>
  );
};
const MemoizedBookingInfo = memo(BookingInfo);
MemoizedBookingInfo.displayName = "BookingInfo";
export default MemoizedBookingInfo;
"use client"
import MemoTypingText from "@/src/components/common/Animation/typingAni"
import type React from "react"

import { useRef, useEffect, memo, useCallback } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/app/redux/store"
// 필요한 import 추가
import { useSelectedMovieForReservation } from "@/app/redux/reduxService"
type Movie = {
  id: number
  tmdbMovieId: number
  kobisMovieCd: string
  title: string
  posterImage: string
  overview: string
  director: string
  genres: string
  releaseDate: string
  runtime: number
}
interface SelectedMovieProps {
  setMemoActiveStep: (id: number) => void
  setMemoMovie: (id: number) => void
}

const SelectedMovie: React.FC<SelectedMovieProps> = ({ setMemoActiveStep, setMemoMovie }) => {
  const boxoffice = useSelector((state: RootState) => state.movieList.movies)
  console.log("랜더링됨.")
  // Redux에서 선택된 영화 ID 가져오기
  const { selectedMovieId, clearSelectedMovie } = useSelectedMovieForReservation()

  const movieList = "영화목록"
  const reserve = "예매하기"

  const bookingMovie = useCallback(
    (id: number) => {
      console.log("예매하기 버튼 클릭됨, 영화 ID:", id)
      setMemoMovie(id)
      // 약간의 지연 후 다음 단계로 이동 (UI 업데이트 보장)
      setTimeout(() => {
        setMemoActiveStep(1)
      }, 50)
    },
    [setMemoActiveStep, setMemoMovie],
  )

  const movieListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("🎥 현재 movieList:", boxoffice)
  }, [boxoffice])

  useEffect(() => {
    if (movieListRef.current) {
      // 데스크톱에서는 부드럽게 스크롤
      if (window.innerWidth >= 100) {
        movieListRef.current.scrollIntoView({
          behavior: "smooth", // 부드러운 스크롤 애니메이션
          block: "start", // 요소의 상단으로 스크롤
        })
      }
    }
  }, [])

  // 선택된 영화 ID가 있으면 자동으로 스크롤 - Redux 사용으로 수정
  useEffect(() => {
    // boxoffice 데이터가 로드되고 Redux에 선택된 영화 ID가 있는 경우
    if (boxoffice.length > 0 && selectedMovieId > 0) {
      // 해당 영화가 목록에 있는지 확인
      const selectedMovie = boxoffice.find((movie) => movie.id === selectedMovieId)
      if (selectedMovie) {
        console.log("Redux에서 선택된 영화 자동 선택:", selectedMovie.title)
        // 영화 선택 처리
        bookingMovie(selectedMovieId)
        // 사용 후 Redux에서 선택된 영화 ID 초기화
        clearSelectedMovie()
      }
    }
  }, [boxoffice, selectedMovieId, bookingMovie, clearSelectedMovie])

  const renderBoxOffice = useCallback(
    () =>
      boxoffice.map((movie: Movie) => {
        return (
          <div
            key={movie.id}
            className="group relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="aspect-[2/3] overflow-hidden">
              <img
                src={movie.posterImage || "/placeholder.svg"}
                alt={movie.title || "영화 포스터"}
                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-base mb-1 truncate" title={movie.title}>
                {movie.title}
              </h3>
              <p className="text-xs text-gray-500 mb-1">{movie.releaseDate}</p>
              <p className="text-xs text-gray-500 mb-3 truncate">{movie.director || "감독 정보 없음"}</p>
              <button
                className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  bookingMovie(movie.id)
                }}
              >
                {reserve}
              </button>
            </div>
          </div>
        )
      }),
    [boxoffice, reserve, bookingMovie],
  )

  return (
    <div>
      <div ref={movieListRef} className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          <MemoTypingText text={movieList} className="text-xl font-bold"></MemoTypingText>
        </h2>
        <button
          onClick={() => setMemoMovie(-1)}
          className="mb-4 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          초기화
        </button>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {boxoffice.length !== 0
            ? renderBoxOffice()
            : Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-[2/3]"></div>
              ))}
        </div>
      </div>
    </div>
  )
}
const MemoizedMoive = memo(SelectedMovie)
MemoizedMoive.displayName = "SelectedMovie"

export default MemoizedMoive


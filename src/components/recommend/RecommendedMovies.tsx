
"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { fetchAIRecommendedMovies, refreshAIRecommendedMovies } from "../common/apiService"

interface AIRecommendedMovie {
  movieId: number
  title: string
  posterImage: string
  reason: string
  tmdbMovieId?: number
}

export const RecommendedMovies = () => {
  const [recommendedMovies, setRecommendedMovies] = useState<AIRecommendedMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [selectingGenre, setSelectingGenre] = useState(false) // 장르 선택 중인지 여부

  const GENRES = ["드라마", "코미디", "스릴러", "애니메이션"]

  const MOVIES_PER_PAGE = 5
  const totalPages = Math.ceil(recommendedMovies.length / MOVIES_PER_PAGE)

  const containerRef = useRef<HTMLDivElement>(null)

  const getUserIdFromLocalStorage = (): number | null => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (!userStr) return null

    try {
      const userData = JSON.parse(userStr)
      return userData.user_id || null
    } catch (e) {
      console.error("user 데이터 파싱 오류:", e)
      return null
    }
  }

  useEffect(() => {
    const fetchRecommended = async () => {
      const userId = getUserIdFromLocalStorage()

      if (!userId) {
        console.log("로그인하지 않아 추천 영화를 가져오지 않음.")
        setLoading(false)
        return
      }

      try {
        const data = await fetchAIRecommendedMovies(userId)
        setRecommendedMovies(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "알 수 없는 오류")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommended()
  }, [])

  const moviesToShow = recommendedMovies.slice(currentPage * MOVIES_PER_PAGE, (currentPage + 1) * MOVIES_PER_PAGE)

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // 드래그 핸들링
  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX)
    setDragging(true)
  }

  const handleDragMove = (clientX: number) => {
    if (!dragging || dragStartX === null) return
    const diff = clientX - dragStartX

    if (Math.abs(diff) > 100) {
      if (diff > 0) {
        prevPage()
      } else {
        nextPage()
      }
      setDragging(false)
      setDragStartX(null)
    }
  }

  const handleDragEnd = () => {
    setDragging(false)
    setDragStartX(null)
  }

  const fetchAndSetRecommendations = async () => {
    const userId = getUserIdFromLocalStorage()
    if (!userId) return
    try {
      const data = await fetchAIRecommendedMovies(userId)
      setRecommendedMovies(data)
    } catch (err: any) {
      setError(err.message || "추천 데이터를 불러오는 중 오류 발생")
    }
  }

  useEffect(() => {
    fetchAndSetRecommendations().finally(() => setLoading(false))
  }, [])

  const handleRefresh = async (type: string) => {
    const userId = getUserIdFromLocalStorage()
    if (!userId) {
      alert("로그인이 필요합니다.")
      return
    }
    setShowModal(false)
    setLoading(true)
    try {
      await refreshAIRecommendedMovies(userId, type)
      await fetchAndSetRecommendations()
      setCurrentPage(0)
    } catch (err: any) {
      setError(err.message || "새로고침 중 오류 발생")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-12">
      {/*<h2 className="text-3xl font-bold mb-6 text-center">AI가 추천하는 영화</h2>*/}

      {/*
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">AI가 추천하는 영화</h2>
        <div>
          <button
            className={`${sortBy === "latest" ? "bg-primary text-white" : "border border-gray-300"} text-xs px-3 py-1.5 rounded mr-2 transition-colors`}
            onClick={() => refreshAIRecommendedMovies(userId)}
          >
            새로고침
          </button>
        </div>
      </div>
      */}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">AI가 추천하는 영화</h2>

        {/*
        <div>
          <button
            className="border border-gray-300 text-xs px-3 py-1.5 rounded transition-colors hover:bg-gray-100"
            onClick={async () => {
              const userId = getUserIdFromLocalStorage()
              if (!userId) {
                alert("로그인이 필요합니다.")
                return
              }

              const confirmed = confirm("추천을 새로고침하겠습니까?")
              if (!confirmed) return

              try {
                setLoading(true)
                await refreshAIRecommendedMovies(userId)

                // 새로고침 후 다시 추천 영화 불러오기
                const updated = await fetchAIRecommendedMovies(userId)
                setRecommendedMovies(updated)
                setCurrentPage(0)
              } catch (err: any) {
                console.error(err)
                setError(err.message || "새로고침 중 오류가 발생했습니다.")
              } finally {
                setLoading(false)
              }
            }}
          >
            새로고침
          </button>
        </div>
          */}

        {/*
        <div>
          <button
            className="border border-gray-300 text-xs px-3 py-1.5 rounded transition-colors hover:bg-gray-100"
            onClick={async () => {
              const userId = getUserIdFromLocalStorage()
              if (!userId) {
                alert("로그인이 필요합니다.")
                return
              }

              // 사용자에게 추천 기준 선택 받기
              const selected = prompt("추천 기준을 선택하세요 (review, genre, popular)")

              // 사용자가 취소하거나 잘못된 값 입력한 경우 종료
              if (!selected || !["review", "genre", "popular"].includes(selected)) {
                alert("올바른 기준을 입력해주세요: review, genre, popular")
                return
              }

              try {
                setLoading(true)

                // 선택 기준에 따라 추천 재요청
                await refreshAIRecommendedMovies(userId, selected)

                // 추천 영화 목록 다시 불러오기
                const updated = await fetchAIRecommendedMovies(userId)
                setRecommendedMovies(updated)
                setCurrentPage(0)
              } catch (err: any) {
                console.error(err)
                setError(err.message || "새로고침 중 오류가 발생했습니다.")
              } finally {
                setLoading(false)
              }
            }}
          >
            새로고침
          </button>
        </div>
        */}

        <button
          className="border border-gray-300 text-xs px-3 py-1.5 rounded transition-colors hover:bg-gray-100"
          onClick={() => {
            setShowModal(true)
            setSelectingGenre(false) // 초기화
          }}
        >
          영화 추천받기
        </button>


        {/*
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-md w-80 text-center">
              <h3 className="text-lg font-semibold mb-4">추천 기준을 선택하세요</h3>
              <div className="flex flex-col gap-3">
                <button
                  className="py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                  onClick={() => handleRefresh("review")}
                >
                  리뷰 기반
                </button>
                <button
                  className="py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
                  onClick={() => handleRefresh("genre")}
                >
                  장르 기반
                </button>
                <button
                  className="py-2 rounded bg-purple-500 text-white hover:bg-purple-600 transition"
                  onClick={() => handleRefresh("popular")}
                >
                  인기 기반
                </button>
                <button
                  className="py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
        */}

        {/* ✅ 선택 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-md w-80 text-center">
              {!selectingGenre ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">추천 기준을 선택하세요</h3>
                  <div className="flex flex-col gap-3">
                    <button
                      className="py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                      onClick={() => handleRefresh("review")}
                    >
                      리뷰 기반
                    </button>
                    <button
                      className="py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
                      onClick={() => setSelectingGenre(true)}
                    >
                      장르 기반
                    </button>
                    <button
                      className="py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                      onClick={() => setShowModal(false)}
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4">장르를 선택하세요</h3>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        className="py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
                        onClick={() => handleRefresh(genre)}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  <button
                    className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-black transition"
                    onClick={() => setSelectingGenre(false)}
                  >
                    ← 이전
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {
        loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : recommendedMovies.length === 0 ? (
          <div className="text-center text-gray-500">추천 영화가 없습니다.</div>
        ) : (
          <div
            className="relative select-none"
            ref={containerRef}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => dragging && handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
          >
            {/* 좌우 화살표 */}
            {currentPage > 0 && (
              <button
                onClick={prevPage}
                className="absolute left-[-40px] top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full hover:bg-gray-100 transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
            {currentPage < totalPages - 1 && (
              <button
                onClick={nextPage}
                className="absolute right-[-40px] top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full hover:bg-gray-100 transition"
              >
                <ArrowRight className="w-6 h-6 text-gray-600" />
              </button>
            )}

            {/* <div className="movie-grid grid grid-cols-6 gap-6 justify-center"> */}
            <div className="recommend-movie-grid justify-center">
              {/* 영화 포스터 화면 맞추려고 빈 div 작성 */}
              <div></div>
              {moviesToShow.map((movie) => (
                <div key={movie.movieId} className="movie-card w-full overflow-hidden">
                  <div className="bg-gray-200 aspect-[7/8] rounded-md mb-3 relative group">
                    <Link href={`/movie/${movie.movieId}`}>
                      <img
                        src={
                          movie.posterImage ||
                          `/placeholder.svg?height=100&width=100&text=${encodeURIComponent(movie.title) || "/placeholder.svg"}`
                        }
                        alt={movie.title}
                        className="h-full w-full object-contain rounded-md transition-opacity group-hover:opacity-75"
                        onError={(e) => {
                          ; (e.target as HTMLImageElement).src =
                            `/placeholder.svg?height=256&width=200&text=${encodeURIComponent(movie.title)}`
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
                        <div className="text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          상세보기
                        </div>
                      </div>
                    </Link>
                  </div>
                  <h3 className="font-medium text-base whitespace-nowrap overflow-hidden text-ellipsis hover:text-primary transition-colors text-center">
                    {movie.title || "영화 추천 이유"}
                  </h3>
                  <br></br>
                  <p className="text-xs text-gray-500 text-center">{movie.reason}</p>
                </div>
              ))}
              {/* 영화 포스터 화면 맞추려고 빈 div 작성 */}
              <div></div>
            </div>

            {/* 페이지 인디케이터 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <span
                    key={index}
                    className={`w-3 h-3 rounded-full ${index === currentPage ? "bg-primary" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            )}
          </div>
        )
      }
    </section >
  )
}

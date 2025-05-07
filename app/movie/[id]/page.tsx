"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Star, User, MessageSquare, Heart, Share2, ArrowLeft, Loader2, Film, Users } from "lucide-react"
import Link from "next/link"
import { getMovie, getCast, getVideos, makeImagePath } from "@/src/components/common/movieService"
import styles from "./styles.module.css"
import { useSelectedMovieForReservation } from "@/app/redux/reduxService"
import { Header } from "@/src/components/common/Header"

export default function MovieDetailPage() {
  const params = useParams()
  const router = useRouter()
  const movieId = params.id as string

  const [movie, setMovie] = useState<any>(null)
  const [casts, setCasts] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  // Redux에서 선택된 영화 ID 관리 훅 사용
  const { setSelectedMovie } = useSelectedMovieForReservation()

  // Review state
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [reviews, setReviews] = useState<
    { id: number; username: string; rating: number; text: string; date: string }[]
  >([
    {
      id: 1,
      username: "영화팬123",
      rating: 4,
      text: "정말 재미있는 영화였습니다. 배우들의 연기가 일품이었고 스토리도 탄탄했습니다.",
      date: "2023-04-01",
    },
    {
      id: 2,
      username: "무비러버",
      rating: 5,
      text: "최고의 영화! 꼭 보세요. 감동과 재미를 모두 느낄 수 있는 작품입니다.",
      date: "2023-03-28",
    },
    {
      id: 3,
      username: "시네필",
      rating: 3,
      text: "기대했던 것보다는 조금 아쉬웠지만 볼만했습니다. 중간 부분이 조금 지루했네요.",
      date: "2023-03-25",
    },
  ])

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr)
          setIsLoggedIn(true)
          setUsername(userData.username || "사용자")
        } catch (error) {
          console.error("사용자 정보 파싱 오류:", error)
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }

    checkLoginStatus()
  }, [])

  // Fetch movie data
  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true)
      try {
        console.log("영화 데이터 로딩 시작:", movieId)

        // Fetch movie details, cast, and videos in parallel
        const [movieData, castData, videoData] = await Promise.all([
          getMovie(movieId),
          getCast(movieId),
          getVideos(movieId),
        ])

        console.log("가져온 영화 데이터:", movieData)
        console.log("가져온 출연진 데이터:", castData)
        console.log("가져온 비디오 데이터:", videoData)

        setMovie(movieData)
        setCasts(castData.slice(0, 10)) // Limit to first 10 cast members
        setVideos(videoData)
      } catch (err) {
        console.error("영화 데이터 로딩 오류:", err)
        setError("영화 정보를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    if (movieId) {
      fetchMovieData()
    }
  }, [movieId])

  // Handlers
  const handleRatingClick = (rating: number) => {
    setUserRating(rating)
  }

  const handleRatingHover = (rating: number) => {
    setHoverRating(rating)
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn) {
      alert("리뷰를 작성하려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    if (userRating === 0) {
      alert("평점을 선택해주세요.")
      return
    }

    if (!reviewText.trim()) {
      alert("리뷰 내용을 입력해주세요.")
      return
    }

    // Add new review
    const newReview = {
      id: Date.now(),
      username: username,
      rating: userRating,
      text: reviewText,
      date: new Date().toISOString().split("T")[0],
    }

    setReviews([newReview, ...reviews])
    setReviewText("")
    setUserRating(0)

    alert("리뷰가 등록되었습니다.")
  }

  const handleBooking = (movieId: number) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.")
      router.push("/login")
      return
    }

    // Redux에 선택한 영화 ID 저장 (기존 코드 유지)
    setSelectedMovie(movieId)

    // 로컬 스토리지에도 영화 ID 저장 (새로 추가)
    localStorage.setItem("selectedMovieId", movieId.toString())
    console.log("예매할 영화 ID를 로컬 스토리지에 저장:", movieId)

    // 예매 페이지로 이동
    router.push(`/reservation`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-600 font-medium">영화 정보 불러오는중...</p>
      </div>
    )
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || "영화 정보를 찾을 수 없습니다."}
        </div>
        <Link href="/" className="text-primary hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  // Find trailer
  const trailer = videos.find((video) => video.type === "Trailer" || video.type === "Teaser")

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "평점 없음"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 공통 헤더 사용 */}
      <Header activePage="movie" />

      <main className="site-container py-8">
        {/* Back button */}
        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          뒤로 가기
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 md:p-8">
          {/* Movie info section using the provided structure */}
          <div className={styles.container}>
            <img
              src={
                movie.poster_path
                  ? makeImagePath(movie.poster_path)
                  : "/placeholder.svg?height=300&width=200&text=No+Image"
              }
              className={styles.poster}
              alt={movie.title}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=200&text=No+Image"
              }}
            />
            <div className={styles.info}>
              <h1 className={styles.title}>{movie.title}</h1>
              <p>
                {movie.release_date?.substring(0, 4) || "N/A"} · ⭐{movie.vote_average?.toFixed(1) || "N/A"} ·{" "}
                {movie.runtime || "N/A"} minutes
              </p>
              <p className={styles.overview}>&nbsp;{movie.overview || "줄거리 정보가 없습니다."}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleBooking(movie.id)}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  예매하기
                </button>
                <button className="px-4 py-2 bg-transparent border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  찜하기
                </button>
                <button className="px-4 py-2 bg-transparent border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center">
                  <Share2 className="h-4 w-4 mr-1" />
                  공유하기
                </button>
              </div>

              {movie.origin_country && movie.origin_country.length > 0 && (
                <div className={styles.imgList}>
                  <img
                    className={styles.flag}
                    src={`https://flagsapi.com/${movie.origin_country[0]}/flat/32.png`}
                    alt={`${movie.origin_country[0]} flag`}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                  {movie.production_companies &&
                    movie.production_companies.length > 0 &&
                    movie.production_companies[0].logo_path && (
                      <img
                        className={styles.production}
                        src={makeImagePath(movie.production_companies[0].logo_path || "")}
                        alt={movie.production_companies[0].name || "Production company"}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    )}
                </div>
              )}

              <a
                href={`https://www.themoviedb.org/movie/${movie.tmdbMovieId || movieId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-2 inline-block"
              >
                더 알아보기 &rarr;
              </a>
            </div>
          </div>

          {/* Trailer section */}
          {trailer && (
            <div className={styles.trailerSection}>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Film className="h-6 w-6 mr-2" />
                트레일러
              </h2>
              <div className={styles.trailerContainer}>
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={`${movie.title} 트레일러`}
                  width="100%"
                  height="100%"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            </div>
          )}

          {/* Cast section using the provided structure */}
          <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            출연진
          </h2>
          <div className={styles.cast}>
            {casts.length > 0 ? (
              casts.map((cast) => (
                <div key={cast.cast_id} className={styles.profile}>
                  <img src={makeImagePath(cast.profile_path || "")} alt={cast.name} />
                  {cast.name}
                  <p className={styles.name}>{cast.character}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">출연진 정보가 없습니다.</p>
            )}
          </div>

          {/* Reviews section */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 mr-2" />
              관람객 리뷰
              <span className="ml-2 text-lg text-gray-500">({reviews.length})</span>
            </h2>

            {/* Review form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold mb-3">리뷰 작성</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">평점</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        onMouseEnter={() => handleRatingHover(rating)}
                        onMouseLeave={() => handleRatingHover(0)}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            (hoverRating || userRating) >= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500 self-center">
                      {userRating > 0 ? `${userRating}점` : "평점을 선택해주세요."}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                    리뷰 내용
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={
                      isLoggedIn
                        ? "영화에 대한 감상을 자유롭게 작성해주세요."
                        : "리뷰를 작성하려면 로그인이 필요합니다."
                    }
                    disabled={!isLoggedIn}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!isLoggedIn}
                    className={`px-4 py-2 rounded-md ${
                      isLoggedIn
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    리뷰 등록
                  </button>
                </div>
              </form>
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded-full p-2 mr-3">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{review.username}</div>
                          <div className="text-sm text-gray-500">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  아직 작성된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

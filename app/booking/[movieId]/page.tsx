"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { selectMovie } from "@/app/redux/redux"
import { fetchMovies } from "@/app/redux/reduxService"
import { Loader2 } from "lucide-react"

export default function BookingPage({ params }: { params: { movieId: string } }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const movieId = Number.parseInt(params.movieId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMovie = async () => {
      try {
        // Fetch all movies
        const movies = await fetchMovies()

        // Find the selected movie by ID
        const selectedMovie = movies.find((movie) => movie.id === movieId)

        if (selectedMovie) {
          // Dispatch the selected movie to Redux store
          dispatch(selectMovie(selectedMovie))

          // Redirect to the reservation page
          router.push("/reservation")
        } else {
          console.error("Movie not found")
          setError("선택한 영화를 찾을 수 없습니다.")
          // 3초 후 홈으로 리다이렉트
          setTimeout(() => router.push("/"), 3000)
        }
      } catch (error) {
        console.error("Error loading movie:", error)
        setError("영화 정보를 불러오는 중 오류가 발생했습니다.")
        // 3초 후 홈으로 리다이렉트
        setTimeout(() => router.push("/"), 3000)
      }
    }

    loadMovie()
  }, [dispatch, movieId, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-gray-500">홈 페이지로 이동합니다...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <span>예매 페이지로 이동 중입니다...</span>
        </div>
      )}
    </div>
  )
}


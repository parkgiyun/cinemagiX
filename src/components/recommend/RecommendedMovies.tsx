import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { fetchAIRecommendedMovies } from "../common/apiService"

interface AIRecommendedMovie {
    movieId: number
    title: string
    posterImage: string
    reason: string
}

export const RecommendedMovies = () => {
    const [recommendedMovies, setRecommendedMovies] = useState<AIRecommendedMovie[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [dragStartX, setDragStartX] = useState<number | null>(null)
    const [dragging, setDragging] = useState(false)

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


    const moviesToShow = recommendedMovies.slice(
        currentPage * MOVIES_PER_PAGE,
        (currentPage + 1) * MOVIES_PER_PAGE
    )

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

    return (
        <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">AI가 추천하는 영화</h2>
            {loading ? (
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

                    <div className="movie-grid grid grid-cols-6 gap-6 justify-center">
                        {moviesToShow.map((movie) => (
                            <div key={movie.movieId} className="movie-card w-full overflow-hidden">
                                <div className="bg-gray-200 aspect-[2/3] rounded-md mb-3 relative group">
                                    <Link href={`/movie/${movie.movieId}`}>
                                        <img
                                            src={movie.posterImage || `/placeholder.svg?height=256&width=200&text=${encodeURIComponent(movie.title)}`}
                                            alt={movie.title}
                                            className="h-full w-full object-contain rounded-md transition-opacity group-hover:opacity-75"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `/placeholder.svg?height=256&width=200&text=${encodeURIComponent(movie.title)}`
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
                                    {movie.title}
                                </h3>
                                <p className="text-xs text-gray-500 text-center">{movie.reason}</p>
                            </div>
                        ))}
                    </div>

                    {/* 페이지 인디케이터 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`w-3 h-3 rounded-full ${index === currentPage ? "bg-primary" : "bg-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
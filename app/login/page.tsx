"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Clock, Calendar, User, MessageSquare, Heart, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from "next/link";
import { useReduxBoxoffice } from "@/app/redux/reduxService";
import { Movie } from "@/src/components/common/typeReserve";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id;
  const { movieList, findMovie_id } = useReduxBoxoffice();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<{id: number, username: string, rating: number, text: string, date: string}[]>([
    {
      id: 1,
      username: "영화팬123",
      rating: 4,
      text: "정말 재미있는 영화였습니다. 배우들의 연기가 일품이었고 스토리도 탄탄했습니다.",
      date: "2023-04-01"
    },
    {
      id: 2,
      username: "무비러버",
      rating: 5,
      text: "최고의 영화! 꼭 보세요. 감동과 재미를 모두 느낄 수 있는 작품입니다.",
      date: "2023-03-28"
    },
    {
      id: 3,
      username: "시네필",
      rating: 3,
      text: "기대했던 것보다는 조금 아쉬웠지만 볼만했습니다. 중간 부분이 조금 지루했네요.",
      date: "2023-03-25"
    }
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUsername(userData.username || "사용자");
        } catch (error) {
          console.error("사용자 정보 파싱 오류:", error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      try {
        // Redux 스토어에서 영화 정보 가져오기
        if (movieList.length > 0) {
          const foundMovie = findMovie_id(Number(movieId));
          if (foundMovie) {
            setMovie(foundMovie);
          } else {
            setError("영화 정보를 찾을 수 없습니다.");
          }
        } else {
          // 영화 목록이 비어있는 경우 API에서 가져오기 시도
          // 실제 구현에서는 여기에 API 호출 코드 추가
          setError("영화 목록을 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("영화 상세 정보 로딩 오류:", err);
        setError("영화 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId, movieList, findMovie_id]);

  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
  };

  const handleRatingHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert("리뷰를 작성하려면 로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    
    if (userRating === 0) {
      alert("평점을 선택해주세요.");
      return;
    }
    
    if (!reviewText.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }
    
    // 새 리뷰 추가
    const newReview = {
      id: Date.now(),
      username: username,
      rating: userRating,
      text: reviewText,
      date: new Date().toISOString().split('T')[0]
    };
    
    setReviews([newReview, ...reviews]);
    setReviewText("");
    setUserRating(0);
    
    alert("리뷰가 등록되었습니다.");
  };

  const handleBooking = () => {
    if (!isLoggedIn) {
      alert("예매하려면 로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    
    if (movie) {
      router.push(`/reservation`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

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
    );
  }

  // 평균 평점 계산
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "평점 없음";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="site-header">
        <div className="site-container flex justify-between items-center">
          <Link href="/" className="site-name">
            CinemagiX
          </Link>
          <nav className="flex">
            {isLoggedIn ? (
              <>
                <span className="nav-link">
                  <span className="text-primary font-medium">{username}</span>님 환영합니다
                </span>
                <Link href="/dashboard" className="nav-link">
                  <span className="bg-primary text-white px-2 py-1 text-xs rounded">마이페이지</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">
                  로그인
                </Link>
                <Link href="/register" className="nav-link">
                  회원가입
                </Link>
                <Link href="/dashboard" className="nav-link">
                  <span className="bg-primary text-white px-2 py-1 text-xs rounded">마이페이지</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 뒤로 가기 버튼 */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          뒤로 가기
        </button>

        {/* 영화 상세 정보 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 영화 헤더 섹션 */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* 포스터 */}
              <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                <div className="rounded-lg overflow-hidden shadow-lg bg-gray-800 aspect-[2/3] relative">
                  <img 
                    src={movie.posterImage || "/placeholder.svg"} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>
              
              {/* 영화 정보 */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-bold">{averageRating}</span>
                    <span className="text-gray-300 ml-1">/ 5</span>
                  </div>
                  <div className="text-gray-300 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{Math.floor(Number(movie.runtime) / 60)}시간 {Number(movie.runtime) % 60}분</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6 text-gray-300">
                  <div className="flex items-start">
                    <span className="font-medium w-20">감독:</span>
                    <span>{movie.director || "정보 없음"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-20">장르:</span>
                    <span>{movie.genres || "정보 없음"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-20">개봉일:</span>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{movie.releaseDate || "정보 없음"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  <button 
                    onClick={handleBooking}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    예매하기
                  </button>
                  <button className="px-4 py-2 bg-transparent border border-gray-400 text-white rounded-md hover:bg-white/10 transition-colors flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    찜하기
                  </button>
                  <button className="px-4 py-2 bg-transparent border border-gray-400 text-white rounded-md hover:bg-white/10 transition-colors flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 영화 내용 섹션 */}
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4">줄거리</h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              {movie.overview || "이 영화에 대한 줄거리 정보가 없습니다."}
            </p>
            
            {/* 평점 및 리뷰 섹션 */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <MessageSquare className="h-6 w-6 mr-2" />
                관람객 리뷰
                <span className="ml-2 text-lg text-gray-500">({reviews.length})</span>
              </h2>
              
              {/* 리뷰 작성 폼 */}
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
                              (hoverRating || userRating) >= rating 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-gray-300"
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-500 self-center">
                        {userRating > 0 ? `${userRating}점` : "평점을 선택해주세요"}
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
                      placeholder={isLoggedIn ? "영화에 대한 감상을 자유롭게 작성해주세요." : "리뷰를 작성하려면 로그인이 필요합니다."}
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
              
              {/* 리뷰 목록 */}
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
                                star <= review.rating 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-gray-300"
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
        </div>
      </main>
    </div>
  );
}

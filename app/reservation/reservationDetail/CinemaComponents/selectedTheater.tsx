"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo, memo } from "react"
import Image from "next/image"
import { scrollAni } from "@/src/components/common/Animation/motionAni"
import { useRegion, useTheather, useMovieRunningDetail, useReduxBoxoffice } from "@/app/redux/reduxService"
import type { Movie, Region, Theater, MovieRunningDetail } from "@/src/components/common/typeReserve"
import { fetchSpotAndDate } from "@/src/components/common/apiService"
import { calcFinishTime } from "@/src/components/common/timeClacService"
import { MapPin, Clock } from "lucide-react"
import { theaterAddresses, theaterImages } from "@/src/components/common/theaterData"
import { getMyTheater } from "@/src/components/common/apiService";

interface SelectedTheaterProps {
  setMemoActiveStep: (id: number) => void
  setMemoMoive: (id: number) => void
  setMemoScreen: (id: number) => void
  setMemoCinema: (region: number, theather: number) => void
  setMemoDate: (id: string) => void
}

const SelectedTheater: React.FC<SelectedTheaterProps> = ({
  setMemoActiveStep,
  setMemoMoive,
  setMemoScreen,
  setMemoCinema,
  setMemoDate,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<number>(-1)
  const [selectedTheater, setSelectedTheater] = useState<number>(-1)
  const [selectedMovie, setSelectedMovie] = useState<number>(-1)
  const [selectedScreen, setSelectedScreen] = useState<number>(-1)
  const [selectedDate, setSelectedDate] = useState<string>("날짜선택")
  const [finishTimes, setFinishTimes] = useState<string[]>([])

  const { regionList } = useRegion()
  const { theaterList, findTheaterId } = useTheather()
  const { movieList, findMovie } = useReduxBoxoffice()
  const { movieRunningDetail, updateMovieRunningDetail } = useMovieRunningDetail()
  const [myTheaterList, setMyTheaterList] = useState<{ id: number; spot_id: number }[]>([]);
  
  const filteredTheaters = useMemo(
    () => theaterList.filter((theater) => theater.region_id === selectedRegion),
    [selectedRegion, theaterList],
  )

  // 선택된 극장 정보를 가져오는 변수
  const selectedTheaterInfo = useMemo(
    () => theaterList.find((theater) => theater.id === selectedTheater),
    [selectedTheater, theaterList],
  )

  const getWeekDates = useMemo(() => {
    const today = new Date()
    const dates = []

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      const yyyy = currentDate.getFullYear()
      const mm = String(currentDate.getMonth() + 1).padStart(2, "0")
      const dd = String(currentDate.getDate()).padStart(2, "0")

      dates.push(`${yyyy}-${mm}-${dd}`)
    }

    return dates
  }, [])

  // 영화 목록 컨테이너에 대한 ref 생성
  const movieListRef = useRef<HTMLDivElement>(null)
  const showtimeRef = useRef<HTMLDivElement>(null)
  const seatButtonRef = useRef<HTMLDivElement>(null)

  const [theaterStep, setTheatherStep] = useState(0)

  useEffect(() => {
    // 선호 영화관 목록 불러오기
    const fetchMyTheaterList = async () => {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!userStr) return;
      let userId = null;
      try {
        const userData = JSON.parse(userStr);
        userId = userData.user_id || userData.id;
      } catch {
        return;
      }
      if (!userId) return;

      try {
        const res = await fetch(`https://hs-cinemagix.duckdns.org/api/v1/detail/retrieve/myTheater?user_id=${userId}`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (data && data.myTheaterList) {
          setMyTheaterList(data.myTheaterList);
        }
      } catch (e) {
        // 에러 무시
      }
    };
    fetchMyTheaterList();
  }, [regionList, theaterList]);

  const handleRegionSelect = (regionId: number) => {
    setSelectedRegion(regionId)
    setSelectedTheater(-1)
    setSelectedMovie(-1)
    setSelectedScreen(-1)
    setSelectedDate("날짜선택")
    setFinishTimes([])
    setTheatherStep(1)
  }

  const handleTheaterSelect = (theaterId: number) => {
    setSelectedTheater(theaterId)
    setSelectedMovie(-1)
    setSelectedScreen(-1)
    setFinishTimes([])
    scrollAni(movieListRef)
    setTheatherStep(2)
  }

  const handleMovieSelect = (movieId: number) => {
    // 같은 영화를 다시 선택한 경우 상영 정보를 유지
    if (selectedMovie === movieId) {
      scrollAni(movieListRef)
      return
    }

    setSelectedMovie(movieId)
    setSelectedScreen(-1)
    setFinishTimes([])
    scrollAni(movieListRef)
    setTheatherStep(2)

    // 영화가 변경되면 상영 정보 초기화
    updateMovieRunningDetail(undefined)

    // 날짜가 이미 선택되어 있으면 상영 정보 다시 로드
    if (selectedDate !== "날짜선택") {
      // 상영 정보는 useEffect에서 자동으로 로드됨
      console.log("영화 변경 후 상영 정보 다시 로드")
    }
  }

  const handleScreenSelect = (screening_id: number) => {
    setSelectedScreen(screening_id)
    setTheatherStep(4)

    // 상태 업데이트 후 스크롤 처리를 약간 지연시켜 상태가 적용된 후 실행되도록 함
    setTimeout(() => {
      scrollAni(seatButtonRef)
    }, 50)
  }
  const handleCinema = () => {
    setMemoMoive(selectedMovie)
    setMemoCinema(selectedRegion, selectedTheater)
    setMemoScreen(selectedScreen)
    setMemoDate(selectedDate)
    setTheatherStep(0)
    setMemoActiveStep(2)
  }

  // 컴포넌트 함수 내부 상단에 추가
  const apiCallInProgress = useRef(false)
  const lastApiParams = useRef<string>("")

  useEffect(() => {
    if (selectedDate === "날짜선택" || selectedMovie === -1 || selectedTheater === -1) {
      // 필수 선택 사항이 없으면 상영 정보 초기화
      updateMovieRunningDetail(undefined)
      return
    }

    // 현재 API 호출 파라미터 생성
    const currentParams = `${selectedTheater}_${selectedDate}_${selectedMovie}`

    // 이전과 동일한 파라미터로 이미 API를 호출 중이거나 완료했으면 중복 호출 방지
    if (apiCallInProgress.current || lastApiParams.current === currentParams) {
      return
    }

    const fetchData = async () => {
      try {
        // API 호출 시작 표시
        apiCallInProgress.current = true
        lastApiParams.current = currentParams

        const theather = findTheaterId(selectedTheater)
        if (theather == undefined) {
          apiCallInProgress.current = false
          return
        }

        console.log(`상영 정보 로드 시작: 극장=${theather.name}, 날짜=${selectedDate}, 영화=${selectedMovie}`)

        const data: MovieRunningDetail[] = await fetchSpotAndDate(theather.name, selectedDate, selectedMovie)

        if (data && data.length > 0) {
          const result = data[0]
          updateMovieRunningDetail(result)
          console.log("상영 정보 로드됨:", result)
        } else {
          // 데이터가 없는 경우 빈 상영 정보 객체 생성
          updateMovieRunningDetail({
            kobisMovieCd: "",
            roomIds: [],
            screeningIds: [],
            startTimes: [],
            tmdbMovieId: 0,
          })
          console.log("상영 정보 없음")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // 에러 발생 시 상영 정보 초기화
        updateMovieRunningDetail(undefined)
      } finally {
        // API 호출 완료 표시
        apiCallInProgress.current = false
      }
    }

    fetchData()
  }, [selectedDate, selectedMovie, selectedTheater, findTheaterId, updateMovieRunningDetail])

  useEffect(() => {
    scrollAni(showtimeRef)

    if (movieRunningDetail == undefined) {
      // 상영 정보가 없을 때는 theaterStep을 변경하지 않습니다
      return
    }

    // 이미 theaterStep이 4(좌석 선택 단계)인 경우 변경하지 않음
    if (theaterStep === 4) {
      return
    }

    // 그 외의 경우에만 theaterStep을 3으로 설정
    setTheatherStep(3)

    const movie: Movie | undefined = findMovie(movieRunningDetail.kobisMovieCd)
    if (movie === undefined) return
    const addTime = []
    for (let i = 0; i < movieRunningDetail.startTimes.length; i++) {
      const time = calcFinishTime(movieRunningDetail.startTimes[i], movie.runtime)
      addTime.push(time)
    }
    setFinishTimes(addTime)
  }, [movieRunningDetail, theaterStep])

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* 내 선호 영화관 탭 */}
          {myTheaterList.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">내 선호 영화관</h2>
              <div className="flex flex-wrap gap-2">
                {myTheaterList.map((fav) => {
                  const theater = theaterList.find(t => t.id === fav.spot_id);
                  const region = regionList.find(r => r.id === theater?.region_id);
                  if (!theater || !region) return null;
                  return (
                    <button
                      key={fav.id}
                      className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200"
                      onClick={() => {
                        setSelectedRegion(region.id);
                        setSelectedTheater(theater.id);
                        setTheatherStep(2);
                        scrollAni(movieListRef);
                      }}
                    >
                      {region.name} - {theater.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-3">지역 선택</h2>
            <div className="flex flex-wrap gap-2">
              {regionList.map((region: Region) => (
                <button
                  key={region.id}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedRegion === region.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleRegionSelect(region.id)}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          {theaterStep > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">극장 선택</h2>
              <div className="space-y-2">
                {filteredTheaters.map((theater: Theater) => (
                  <div
                    key={theater.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTheater === theater.id
                        ? "border-blue-500 ring-2 ring-blue-500/50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleTheaterSelect(theater.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-[60px] h-[40px] bg-gray-200 rounded overflow-hidden">
                        <Image
                          src={theaterImages[theater.id] || "/placeholder.svg"}
                          alt={theater.name}
                          width={60}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{theater.name}</h3>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{theaterAddresses[theater.id as keyof typeof theaterAddresses]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Movie selection and showtimes */}
        <div className="md:col-span-2">
          {theaterStep > 1 ? (
            <>
              {/* Right column: Movie selection and showtimes */}
              <div className="md:col-span-2" ref={movieListRef}>
                {movieList ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">{selectedTheaterInfo?.name || "극장"} 상영 영화</h2>

                      <div className="relative">
                        <select
                          title="1"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option key={0} value={"날짜선택"}>
                            날짜선택
                          </option>
                          {getWeekDates.map((date: string, i: number) => {
                            return (
                              <option key={i} value={date}>
                                {date}
                              </option>
                            )
                          })}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 영화 목록을 스크롤 가능한 컨테이너로 감싸기 */}
                    {movieList ? (
                      <div className="h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {movieList.map((movie: Movie) => (
                            <div
                              key={movie.id}
                              className={`rounded-lg border overflow-hidden cursor-pointer transition-all ${
                                selectedMovie === movie.id
                                  ? "border-blue-500 ring-2 ring-blue-500/50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleMovieSelect(movie.id)}
                            >
                              <div className="relative">
                                <img
                                  src={movie.posterImage || "/placeholder.svg"}
                                  alt={"/error.png"}
                                  width={200}
                                  height={300}
                                  className="w-full h-[250px] object-cover"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                              <div className="p-3">
                                <h3 className="font-bold text-lg truncate" title={movie.title}>
                                  {movie.title}
                                </h3>
                                <p className="text-sm text-gray-500">{movie.director}</p>
                                <div className="flex items-center mt-2 text-sm">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00.364-.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {movie.releaseDate}
                                </div>
                                <div className="flex justify-between mt-2 text-sm text-gray-500">
                                  <span className="truncate" title={movie.genres}>
                                    {movie.genres}
                                  </span>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {Math.floor(Number(movie.runtime) / 60)}시간 {Number(movie.runtime) % 60}분
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedMovie && selectedDate !== "날짜선택" && (
                      <div className="py-16" ref={showtimeRef}>
                        <h3 className="text-lg font-semibold mb-3">상영 시간</h3>
                        <div className="flex flex-wrap gap-2">
                          {movieRunningDetail !== undefined && movieRunningDetail.screeningIds ? (
                            movieRunningDetail.screeningIds.length > 0 ? (
                              movieRunningDetail.screeningIds.map((screening_id: number, i: number) => (
                                <button
                                  key={screening_id}
                                  className={`flex flex-col items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                                    selectedScreen === screening_id
                                      ? "bg-blue-500 text-white border-blue-500"
                                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                  }`}
                                  onClick={() => handleScreenSelect(screening_id)}
                                >
                                  <span className="font-bold">{movieRunningDetail.startTimes[i]}</span>
                                  <span className="text-xs">{finishTimes[i]}</span>
                                </button>
                              ))
                            ) : (
                              <div>선택한 날짜에 상영 일정이 없습니다.</div>
                            )
                          ) : (
                            <div>해당 영화에 대한 상영정보가 없습니다.</div>
                          )}
                        </div>
                        {selectedScreen !== -1 && (
                          <div className="mt-6 flex justify-end" ref={seatButtonRef}>
                            <button
                              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                              onClick={() => handleCinema()}
                            >
                              좌석 선택하기
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedMovie && selectedDate === "날짜선택" && (
                      <div className="py-8 text-center bg-gray-50 rounded-lg border border-gray-200 mt-4">
                        <p className="text-gray-600">상영 시간을 확인하려면 날짜를 선택해주세요.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px] border rounded-lg bg-gray-50">
                    <p className="text-gray-500">지역과 극장을 선택해주세요</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] border rounded-lg bg-gray-50">
              <p className="text-gray-500">지역과 극장을 선택해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
const MemoizedSelectedTheater = memo(SelectedTheater)
MemoizedSelectedTheater.displayName = "SelectedTheater"
export default MemoizedSelectedTheater
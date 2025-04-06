"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo, memo } from "react"
import Image from "next/image"
import { scrollAni } from "@/src/components/common/Animation/motionAni"
import { useRegion, useTheather, useMovieRunningDetail, useReduxBoxoffice } from "@/app/redux/reduxService"
import { fetchSpotAndDate } from "@/src/components/common/apiService"
import type { Movie, Region, Theater, MovieRunningDetail } from "@/src/components/common/typeReserve"
import { calcFinishTime } from "@/src/components/common/timeClacService"
import { MapPin, Film, Popcorn, Car, Accessibility, Star, Clock } from "lucide-react"

interface SelectedTheaterProps {
  setMemoActiveStep: (id: number) => void
  setMemoMoive: (id: number) => void
  setMemoScreen: (id: number) => void
  setMemoCinema: (region: number, theather: number) => void
  setMemoDate: (id: string) => void
}

// 극장 특성 데이터 (api?)
const theaterFeatures = {
  1: { hasImax: true, has4dx: false, hasParking: true, hasFood: true, hasAccessibility: true, rating: 4.5 },
  2: { hasImax: false, has4dx: true, hasParking: true, hasFood: true, hasAccessibility: false, rating: 4.2 },
  3: { hasImax: true, has4dx: true, hasParking: false, hasFood: true, hasAccessibility: true, rating: 4.7 },
  4: { hasImax: false, has4dx: false, hasParking: true, hasFood: false, hasAccessibility: true, rating: 4.0 },
  5: { hasImax: true, has4dx: false, hasParking: true, hasFood: true, hasAccessibility: true, rating: 4.3 },
  6: { hasImax: false, has4dx: true, hasParking: true, hasFood: true, hasAccessibility: false, rating: 4.1 },
  7: { hasImax: true, has4dx: false, hasParking: true, hasFood: false, hasAccessibility: true, rating: 4.4 },
  8: { hasImax: false, has4dx: true, hasParking: false, hasFood: true, hasAccessibility: true, rating: 4.6 },
  9: { hasImax: true, has4dx: false, hasParking: true, hasFood: true, hasAccessibility: false, rating: 4.2 },
  10: { hasImax: false, has4dx: true, hasParking: true, hasFood: false, hasAccessibility: true, rating: 4.5 },
  11: { hasImax: true, has4dx: true, hasParking: true, hasFood: true, hasAccessibility: true, rating: 4.8 },
  12: { hasImax: false, has4dx: false, hasParking: true, hasFood: true, hasAccessibility: false, rating: 4.0 },
  13: { hasImax: true, has4dx: false, hasParking: false, hasFood: true, hasAccessibility: true, rating: 4.3 },
  14: { hasImax: false, has4dx: true, hasParking: true, hasFood: false, hasAccessibility: false, rating: 4.1 },
  15: { hasImax: true, has4dx: false, hasParking: true, hasFood: true, hasAccessibility: true, rating: 4.4 },
  16: { hasImax: false, has4dx: true, hasParking: false, hasFood: true, hasAccessibility: false, rating: 4.2 },
  17: { hasImax: true, has4dx: false, hasParking: true, hasFood: false, hasAccessibility: true, rating: 4.5 },
  18: { hasImax: false, has4dx: true, hasParking: true, hasFood: true, hasAccessibility: false, rating: 4.3 },
  19: { hasImax: true, has4dx: false, hasParking: false, hasFood: true, hasAccessibility: true, rating: 4.6 },
  20: { hasImax: false, has4dx: true, hasParking: true, hasFood: false, hasAccessibility: false, rating: 4.2 },
  21: { hasImax: true, has4dx: false, hasParking: true, hasFood: true, hasAccessibility: true, rating: 4.7 },
  22: { hasImax: false, has4dx: true, hasParking: false, hasFood: true, hasAccessibility: false, rating: 4.4 },
  23: { hasImax: true, has4dx: false, hasParking: true, hasFood: false, hasAccessibility: true, rating: 4.3 },
  24: { hasImax: false, has4dx: true, hasParking: true, hasFood: true, hasAccessibility: false, rating: 4.5 },
  25: { hasImax: true, has4dx: false, hasParking: false, hasFood: true, hasAccessibility: true, rating: 4.2 },
  26: { hasImax: false, has4dx: true, hasParking: true, hasFood: false, hasAccessibility: false, rating: 4.6 },
  27: { hasImax: true, has4dx: false, hasParking: true, hasFood: true, hasAccessibility: true, rating: 4.8 },
}

// 지역별 대표 주소 (api?)
const regionAddresses = {
  1: "서울특별시",
  2: "경기도",
  3: "인천광역시",
  4: "강원특별자치도",
  5: "대구광역시",
  6: "부산광역시",
  7: "제주특별자치도",
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
    setSelectedDate("날짜선택")
    setFinishTimes([])
    scrollAni(movieListRef)
    setTheatherStep(2)
  }

  const handleMovieSelect = (movieId: number) => {
    setSelectedMovie(movieId)
    setSelectedScreen(-1)
    setSelectedDate("날짜선택")
    setFinishTimes([])
    scrollAni(movieListRef)
    setTheatherStep(2)

    // 여기서 스크린 상영정보 api 통신 추가.
  }

  const handleScreenSelect = (screening_id: number) => {
    setSelectedScreen(screening_id)
    setTheatherStep(4)
    scrollAni(seatButtonRef)
  }
  const handleCinema = () => {
    setMemoMoive(selectedMovie)
    setMemoCinema(selectedRegion, selectedTheater)
    setMemoScreen(selectedScreen)
    setMemoDate(selectedDate)
    setTheatherStep(0)
    setMemoActiveStep(2)
  }

  useEffect(() => {
    if (selectedDate === "날짜선택") return
    const fetchData = async () => {
      try {
        const theather = findTheaterId(selectedTheater)
        if (theather == undefined) return // theather가 undefined일 경우 처리
        const data: MovieRunningDetail[] = await fetchSpotAndDate(theather.name, selectedDate, selectedMovie)
        const result = data[0]
        updateMovieRunningDetail(result)
        console.log(movieRunningDetail)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [selectedDate])

  useEffect(() => {
    scrollAni(showtimeRef)
    //console.log(movieRunningDetail);
    if (movieRunningDetail == undefined) {
      updateMovieRunningDetail(undefined)
      return
    }
    setTheatherStep(3)
    const movie: Movie | undefined = findMovie(movieRunningDetail.kobisMovieCd)
    if (movie === undefined) return
    const addTime = []
    for (let i = 0; i < movieRunningDetail.startTimes.length; i++) {
      const time = calcFinishTime(movieRunningDetail.startTimes[i], movie.runtime)
      addTime.push(time)
    }
    setFinishTimes(addTime)
  }, [movieRunningDetail])

  // 극장 특성 아이콘 렌더링 함수
  const renderTheaterFeatures = (theaterId: number) => {
    const features = theaterFeatures[theaterId as keyof typeof theaterFeatures]
    if (!features) return null

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {features.hasImax && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <Film className="w-3 h-3 mr-0.5" />
            IMAX
          </span>
        )}
        {features.has4dx && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            <Film className="w-3 h-3 mr-0.5" />
            4DX
          </span>
        )}
        {features.hasParking && (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            title="주차 가능"
          >
            <Car className="w-3 h-3" />
          </span>
        )}
        {features.hasFood && (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
            title="매점 있음"
          >
            <Popcorn className="w-3 h-3" />
          </span>
        )}
        {features.hasAccessibility && (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
            title="장애인 접근성"
          >
            <Accessibility className="w-3 h-3" />
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
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
                {filteredTheaters.map((theater: Theater) => {
                  const features = theaterFeatures[theater.id as keyof typeof theaterFeatures]
                  return (
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
                            src={"/placeholder.svg"}
                            alt={theater.name}
                            width={60}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                          {features && (
                            <div className="absolute top-0 right-0 p-0.5 bg-yellow-400 rounded-bl">
                              <Star className="w-3 h-3 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">{theater.name}</h3>
                            {features && (
                              <div className="ml-2 flex items-center text-yellow-500">
                                <Star className="w-3 h-3 fill-yellow-500" />
                                <span className="text-xs ml-0.5">{features.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{regionAddresses[theater.region_id as keyof typeof regionAddresses]}</span>
                          </div>
                          {renderTheaterFeatures(theater.id)}
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

                    {selectedMovie && (
                      <div className="py-16" ref={showtimeRef}>
                        <h3 className="text-lg font-semibold mb-3">상영 시간</h3>
                        <div className="flex flex-wrap gap-2">
                          {movieRunningDetail !== undefined ? (
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
                                {/* <span
                                className={`text-xs ${
                                  selectedStart === movieRunningDetail.startTimes[i]
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                //{showtime.seats}
                              </span> */}
                              </button>
                            ))
                          ) : (
                            <div>해당 영화에 대한 상영정보가 없습니다.</div>
                          )}
                        </div>
                        {theaterStep > 3 && (
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


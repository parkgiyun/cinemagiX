import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "./store"
import { setMovieList, setMovieRunningDetail } from "./redux"

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

// 영화 목록을 가져오는 함수
export const fetchMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch("/api/movies/daliy")
    if (!response.ok) {
      throw new Error("영화 데이터를 가져오는데 실패했습니다.")
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("영화 데이터 가져오기 오류:", error)
    throw error
  }
}

// useReduxBoxoffice 훅에 selectedMovie 관련 기능 추가
export const useReduxBoxoffice = () => {
  const dispatch = useDispatch()
  const movieList = useSelector((state: RootState) => state.movieList.movies)
  const selectedMovie = useSelector((state: RootState) => state.movieList.selectedMovie)

  const updateMovieList = (newMovieList: Movie[]) => {
    dispatch(setMovieList(newMovieList))
  }

  const findMovie = (kobisMovieCd: string) => {
    return movieList.find((m) => Number(m.kobisMovieCd) == Number(kobisMovieCd))
  }

  const findMovie_id = (id: number) => {
    return movieList.find((m) => m.id == id)
  }

  return { movieList, selectedMovie, updateMovieList, findMovie, findMovie_id }
}

export const useRegion = () => {
  const regionList = useSelector((state: RootState) => state.regionList.regions)

  const findRegion = (region_id: number) => {
    return regionList.filter((r) => r.id === region_id)
  }
  return { regionList, findRegion }
}
type Theater = {
  id: number
  region_id: number
  name: string
}
export const useTheather = () => {
  const theaterList = useSelector((state: RootState) => state.theaterList.theaters)
  const findTheaterId = (theaterId: number) => {
    //if (theaterId === undefined) return;
    //const result = theaterList.find((t) => t.id == theaterId);
    return theaterList.find((t) => t.id == theaterId)
  }
  return { theaterList, findTheaterId }
}

type MovieRunningDetail =
  | {
      kobisMovieCd: string
      roomIds: number[]
      screeningIds: number[]
      startTimes: string[]
      tmdbMovieId: 696506
    }
  | undefined
export const useMovieRunningDetail = () => {
  const dispatch = useDispatch()
  const movieRunningDetail = useSelector((state: RootState) => state.movieRunningDetail.movieRunningDetail)
  const updateMovieRunningDetail = (movieRunningDetail: MovieRunningDetail) => {
    dispatch(setMovieRunningDetail(movieRunningDetail))
  }
  const findStartTime = (screen_id: number) => {
    if (movieRunningDetail?.kobisMovieCd === undefined) return -1
    return movieRunningDetail.screeningIds.findIndex((ids) => ids === screen_id)
  }
  return { movieRunningDetail, updateMovieRunningDetail, findStartTime }
}


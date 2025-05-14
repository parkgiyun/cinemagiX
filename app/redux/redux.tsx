import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

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

const movieListSlices = createSlice({
  name: "movieList",
  initialState: { movies: [] as Movie[], selectedMovie: null as Movie | null },
  reducers: {
    setMovieList: (state, action: PayloadAction<Movie[]>) => {
      state.movies = action.payload
      console.log(action.payload)
    },
    selectMovie: (state, action: PayloadAction<Movie>) => {
      state.selectedMovie = action.payload
      console.log("Selected movie:", action.payload)
    },
  },
})

type Region = {
  id: number
  name: string
}
const regionListSlices = createSlice({
  name: "regionList",
  initialState: {
    regions: [
      { id: 1, name: "서울" },
      { id: 2, name: "경기" },
      { id: 3, name: "인천" },
      { id: 4, name: "강원" },
      { id: 5, name: "대구" },
      { id: 6, name: "부산" },
      { id: 7, name: "제주" },
    ] as Region[],
  },
  reducers: {},
})

type Theater = {
  id: number
  region_id: number
  name: string
}
const theaterListSlices = createSlice({
  name: "theaterList",
  initialState: {
    theaters: [
      { id: 1, region_id: 1, name: "강남" },
      { id: 2, region_id: 1, name: "건대입구" },
      { id: 3, region_id: 1, name: "대학로" },
      { id: 4, region_id: 1, name: "미아" },
      { id: 5, region_id: 2, name: "남양주" },
      { id: 7, region_id: 2, name: "동탄" },
      { id: 8, region_id: 2, name: "분당" },
      { id: 6, region_id: 2, name: "수원" },
      { id: 12, region_id: 3, name: "검단" },
      { id: 10, region_id: 3, name: "송도" },
      { id: 11, region_id: 3, name: "영종" },
      { id: 9, region_id: 3, name: "인천논현" },
      { id: 13, region_id: 4, name: "남춘천" },
      { id: 14, region_id: 4, name: "속초" },
      { id: 15, region_id: 4, name: "원주혁신" },
      { id: 16, region_id: 4, name: "춘천석사" },
      { id: 18, region_id: 5, name: "대구신세계" },
      { id: 17, region_id: 5, name: "대구이시아" },
      { id: 19, region_id: 5, name: "마산" },
      { id: 20, region_id: 5, name: "창원" },
      { id: 24, region_id: 6, name: "경상대" },
      { id: 21, region_id: 6, name: "덕천" },
      { id: 23, region_id: 6, name: "부산대" },
      { id: 22, region_id: 6, name: "해운대" },
      { id: 26, region_id: 7, name: "서귀포" },
      { id: 25, region_id: 7, name: "제주삼화" },
      { id: 27, region_id: 7, name: "제주아라" },
    ] as Theater[],
  },
  reducers: {},
})
type movieRunningDetail =
  | {
      kobisMovieCd: string
      roomIds: number[]
      screeningIds: number[]
      startTimes: string[]
      tmdbMovieId: number
    }
  | undefined

const movieRunningDetailSlices = createSlice({
  name: "movieRunningDetail",
  initialState: { movieRunningDetail: undefined as movieRunningDetail },
  reducers: {
    setMovieRunningDetail: (state, action) => {
      state.movieRunningDetail = action.payload
    },
  },
})

// 새로운 슬라이스 추가: 예매를 위해 선택된 영화 ID를 저장
const selectedMovieForReservationSlice = createSlice({
  name: "selectedMovieForReservation",
  initialState: { movieId: -1 },
  reducers: {
    setSelectedMovieForReservation: (state, action: PayloadAction<number>) => {
      state.movieId = action.payload
      console.log("예매를 위해 선택된 영화 ID:", action.payload)
    },
    clearSelectedMovieForReservation: (state) => {
      state.movieId = -1
    },
  },
})

export const { setMovieList, selectMovie } = movieListSlices.actions
export const { setMovieRunningDetail } = movieRunningDetailSlices.actions
export const { setSelectedMovieForReservation, clearSelectedMovieForReservation } =
  selectedMovieForReservationSlice.actions

export const movieListSlicesReducer = movieListSlices.reducer
export const regionListSlicesReducer = regionListSlices.reducer
export const theaterListSlicesReducer = theaterListSlices.reducer
export const movieRunningDetailReducer = movieRunningDetailSlices.reducer
export const selectedMovieForReservationReducer = selectedMovieForReservationSlice.reducer

export type Movie = {
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
  
  export type Region = {
    id: number
    name: string
  }
  
  export type Theater = {
    id: number
    region_id: number
    name: string
  }
  
  export type MovieRunningDetail =
    | {
        kobisMovieCd: string
        roomIds: number[]
        screeningIds: number[]
        startTimes: string[]
        tmdbMovieId: 696506
      }
    | undefined
  
  
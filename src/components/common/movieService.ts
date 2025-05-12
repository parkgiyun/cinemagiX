// TMDB API와 로컬 데이터베이스에서 영화 정보를 가져오는 서비스

// Base URL for TMDB API
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
// 환경 변수에서 API 키 가져오기
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || ""

// API 키가 없을 경우 경고 로그 출력
if (!API_KEY) {
  console.warn("TMDB API 키가 설정되지 않았습니다. 환경 변수 NEXT_PUBLIC_TMDB_API_KEY를 확인하세요.")
}

// 영화 데이터 캐시 (ID를 키로 사용)
const movieCache: { [key: string]: any } = {}

// Function to create image paths
export function makeImagePath(path: string, width = "w500") {
  if (!path || path.includes("null")) return "/placeholder.svg?height=300&width=200&text=No+Image"
  if (path.startsWith("/")) {
    return `https://image.tmdb.org/t/p/${width}${path}`
  }
  return path // 이미 전체 URL인 경우
}

// 로컬 데이터베이스에서 영화 정보 가져오기 (캐싱 적용)
async function getLocalMovie(id: string) {
  // 캐시에 있으면 캐시된 데이터 반환
  if (movieCache[id]) {
    console.log(`캐시에서 영화 정보 가져옴: ID ${id}`)
    return movieCache[id]
  }

  try {
    // daily API 호출하여 모든 영화 목록 가져오기
    const response = await fetch("/api/movies/daliy")

    if (!response.ok) {
      throw new Error(`영화 목록 가져오기 실패: ${response.status}`)
    }

    const data = await response.json()

    // 받아온 영화 목록에서 해당 ID를 가진 영화 찾기
    const movie = data.find((movie: any) => movie.id.toString() === id)

    if (!movie) {
      console.error(`ID ${id}에 해당하는 영화를 찾을 수 없습니다.`)
      return null
    }

    // 찾은 영화 정보를 캐시에 저장
    movieCache[id] = movie
    console.log("daily API에서 찾은 영화 정보:", movie)
    return movie
  } catch (error) {
    console.error("영화 정보 가져오기 오류:", error)
    return null
  }
}

// TMDB API에서 영화 정보 가져오기 (로컬 ID로 가져온 영화의 TMDB ID를 사용)
async function getTMDBMovie(tmdbId: string) {
  try {
    // TMDB API 호출
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${API_KEY}&language=ko-KR&append_to_response=credits,videos`,
    )

    if (!response.ok) {
      throw new Error(`TMDB 영화 정보 가져오기 실패: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("TMDB 영화 정보 가져오기 오류:", error)
    throw error
  }
}

// 영화 정보, 출연진, 비디오를 한 번에 가져오는 통합 함수
export async function getMovieAllData(localId: string) {
  console.log(`영화 전체 데이터 가져오기 시작: ID ${localId}`)

  try {
    // 로컬 ID로 영화 정보 가져오기 (한 번만 호출)
    const localMovie = await getLocalMovie(localId)

    if (!localMovie) {
      console.error(`로컬 ID ${localId}로 영화 정보를 찾을 수 없습니다.`)
      throw new Error("영화 정보를 찾을 수 없습니다.")
    }

    console.log("로컬에서 영화 정보 찾음:", localMovie)

    // 기본 결과 객체 초기화
    const result = {
      movie: {
        ...localMovie,
        id: localMovie.id,
        title: localMovie.title,
        poster_path: localMovie.posterImage,
        release_date: localMovie.releaseDate,
        vote_average: 0,
        runtime: localMovie.runtime || 0,
        overview: localMovie.overview || "줄거리 정보가 없습니다.",
        origin_country: ["KR"],
        production_companies: [],
      },
      cast: [],
      videos: [],
    }

    // 로컬 영화 정보에 TMDB ID가 있으면 TMDB에서 추가 정보 가져오기
    if (localMovie.tmdbMovieId) {
      try {
        console.log(`로컬 영화의 TMDB ID로 추가 정보 가져오기: ${localMovie.tmdbMovieId}`)
        const tmdbData = await getTMDBMovie(localMovie.tmdbMovieId.toString())

        // 영화 정보 병합
        result.movie = {
          ...result.movie,
          ...tmdbData,
          id: localMovie.id, // 로컬 ID 유지
          tmdbMovieId: tmdbData.id || localMovie.tmdbMovieId,
          title: localMovie.title || tmdbData.title,
          poster_path: localMovie.posterImage || tmdbData.poster_path,
          release_date: localMovie.releaseDate || tmdbData.release_date,
          vote_average: tmdbData.vote_average || 0,
          runtime: tmdbData.runtime || localMovie.runtime || 0,
          overview: tmdbData.overview || localMovie.overview || "줄거리 정보가 없습니다.",
          origin_country: tmdbData.production_countries?.map((c: { iso_3166_1: string }) => c.iso_3166_1) || ["KR"],
          production_companies: tmdbData.production_companies || [],
        }

        // 출연진 정보 추출
        if (tmdbData.credits && tmdbData.credits.cast) {
          result.cast = tmdbData.credits.cast.slice(0, 10) // 상위 10명만 가져오기
        }

        // 비디오 정보 추출
        if (tmdbData.videos && tmdbData.videos.results) {
          result.videos = tmdbData.videos.results
        }
      } catch (tmdbError) {
        console.error("TMDB에서 추가 정보 가져오기 실패:", tmdbError)
        // TMDB 정보 가져오기 실패 시 기본 정보만 반환
      }
    }

    return result
  } catch (error) {
    console.error("영화 정보 가져오기 최종 오류:", error)
    throw error
  }
}

// 기존 함수들은 새로운 통합 함수를 사용하도록 수정
export async function getMovie(localId: string) {
  try {
    const allData = await getMovieAllData(localId)
    return allData.movie
  } catch (error) {
    console.error("영화 정보 가져오기 오류:", error)
    // 기본 영화 객체 반환
    return {
      title: "영화 정보 없음",
      release_date: "",
      vote_average: 0,
      runtime: 0,
      overview: "영화 정보를 가져오는데 실패했습니다.",
      origin_country: [""],
      production_companies: [{ logo_path: "" }],
      poster_path: "",
    }
  }
}

export async function getCast(localId: string) {
  try {
    const allData = await getMovieAllData(localId)
    return allData.cast
  } catch (error) {
    console.error("출연진 정보 가져오기 오류:", error)
    return []
  }
}

export async function getVideos(localId: string) {
  try {
    const allData = await getMovieAllData(localId)
    return allData.videos
  } catch (error) {
    console.error("비디오 정보 가져오기 오류:", error)
    return []
  }
}

// 트레일러 불러오기
export function movieTrailer(localId: string) {
  // 이 함수는 직접 사용되지 않고 URL만 반환하므로 간단히 처리
  return `${TMDB_BASE_URL}/movie/${localId}/videos?api_key=${API_KEY}`
}

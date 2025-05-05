// TMDB API와 로컬 데이터베이스에서 영화 정보를 가져오는 서비스

// Base URL for TMDB API
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = "f613772b7ede7a7150acb1592fbb88e0" // 이거 괜찮은가....?

// Function to create image paths
export function makeImagePath(path: string, width = "w500") {
  if (!path || path.includes("null")) return "/placeholder.svg?height=300&width=200&text=No+Image"
  if (path.startsWith("/")) {
    return `https://image.tmdb.org/t/p/${width}${path}`
  }
  return path // 이미 전체 URL인 경우
}

// 로컬 데이터와 TMDB 데이터 모두 처리
export async function getMovie(id: string) {
  console.log(`영화 정보 가져오기 시작: ID ${id}`)

  try {
    // 먼저 로컬 Redux 스토어에서 영화 정보 확인 시도
    const localMovie = await getLocalMovie(id)

    if (localMovie) {
      console.log("로컬에서 영화 정보 찾음:", localMovie)

      // TMDB ID가 있으면 추가 정보 가져오기 시도
      if (localMovie.tmdbMovieId) {
        try {
          const tmdbMovie = await getTMDBMovie(localMovie.tmdbMovieId.toString())
          console.log("TMDB에서 추가 정보 가져옴:", tmdbMovie)

          // 두 정보 병합
          return {
            ...localMovie,
            ...tmdbMovie,
            // 로컬 정보 우선 사용
            title: localMovie.title || tmdbMovie.title,
            poster_path: localMovie.posterImage || tmdbMovie.poster_path,
            // 추가 필드 매핑
            vote_average: tmdbMovie.vote_average || 0,
            origin_country: tmdbMovie.production_countries?.map((c: { iso_3166_1: string }) => c.iso_3166_1) || ["KR"],
            production_companies: tmdbMovie.production_companies || [],
          }
        } catch (tmdbError) {
          console.error("TMDB 추가 정보 가져오기 실패:", tmdbError)
          // TMDB 정보 없이 로컬 정보만 반환
          return {
            ...localMovie,
            title: localMovie.title,
            poster_path: localMovie.posterImage,
            release_date: localMovie.releaseDate,
            vote_average: 0,
            runtime: localMovie.runtime || 0,
            overview: localMovie.overview || "줄거리 정보가 없습니다.",
            origin_country: ["KR"],
            production_companies: [],
          }
        }
      }

      // TMDB ID가 없는 경우 로컬 정보만 반환
      return {
        ...localMovie,
        title: localMovie.title,
        poster_path: localMovie.posterImage,
        release_date: localMovie.releaseDate,
        vote_average: 0,
        runtime: localMovie.runtime || 0,
        overview: localMovie.overview || "줄거리 정보가 없습니다.",
        origin_country: ["KR"],
        production_companies: [],
      }
    }

    // 로컬에 없으면 직접 TMDB API 호출 시도
    console.log("로컬에 영화 정보가 없어 TMDB API 직접 호출")
    return await getTMDBMovie(id)
  } catch (error) {
    console.error("영화 정보 가져오기 최종 오류:", error)
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

// 로컬 데이터베이스에서 영화 정보 가져오기
async function getLocalMovie(id: string) {
  try {
    // 로컬 API 엔드포인트 호출
    const response = await fetch(`/api/movies/detail?id=${id}`)

    if (!response.ok) {
      throw new Error(`로컬 영화 정보 가져오기 실패: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("로컬 영화 정보 가져오기 오류:", error)
    return null
  }
}

// TMDB API에서 영화 정보 가져오기
async function getTMDBMovie(id: string) {
  try {
    // TMDB API 호출
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ko-KR`)

    if (!response.ok) {
      throw new Error(`TMDB 영화 정보 가져오기 실패: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("TMDB 영화 정보 가져오기 오류:", error)
    throw error
  }
}

// 출연진 정보 가져오기
export async function getCast(id: string) {
  console.log(`출연진 정보 가져오기 시작: ID ${id}`)

  try {
    // 먼저 로컬 영화 정보 가져오기
    const localMovie = await getLocalMovie(id)

    // TMDB ID가 있으면 그걸로 출연진 정보 가져오기
    const tmdbId = localMovie?.tmdbMovieId || id

    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${API_KEY}&language=ko-KR`)

    if (!response.ok) {
      throw new Error("출연진 정보를 가져오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.cast || []
  } catch (error) {
    console.error("출연진 정보 가져오기 오류:", error)
    return []
  }
}

// 영화 비디오 정보 가져오기
export async function getVideos(id: string) {
  console.log(`비디오 정보 가져오기 시작: ID ${id}`)

  try {
    // 먼저 로컬 영화 정보 가져오기
    const localMovie = await getLocalMovie(id)

    // TMDB ID가 있으면 그걸로 비디오 정보 가져오기
    const tmdbId = localMovie?.tmdbMovieId || id

    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}/videos?api_key=${API_KEY}&language=ko-KR`)

    if (!response.ok) {
      throw new Error("비디오 정보를 가져오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("비디오 정보 가져오기 오류:", error)
    return []
  }
}

// Function to get movie trailer
export function movieTrailer(id: string) {
  return `${TMDB_BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`
}


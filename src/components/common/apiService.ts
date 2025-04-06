"server client"

import axios from "axios"

const API_BASE_URL = "http://localhost:8080/api"

/**
 * API 요청을 처리하는 서비스 함수
 * @param url API 엔드포인트 경로
 * @param data 요청 데이터
 * @returns 응답 데이터
 */
export const apiService = async (url: string, data: object) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${url}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      withCredentials: true, // CORS 관련 쿠키 전송 허용
    })

    return response.data
  } catch (err: unknown) {
    console.error("Error details:", err)

    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인하세요.", // 에러 메시지 구체적으로?
      )
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}

/**
 * GET 요청을 처리하는 서비스 함수
 * @param url API 엔드포인트 경로
 * @param token 인증 토큰 (선택적)
 * @returns 응답 데이터
 */
export const apiServiceGet = async (url: string, token?: string) => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await axios.get(`${API_BASE_URL}${url}`, {
      headers,
      withCredentials: true,
    })

    return response.data
  } catch (err: unknown) {
    console.error("Error details:", err)

    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인하세요.",
      )
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}

export const fetchBoxofficeGet = async () => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    const response = await axios.get(`${API_BASE_URL}/v1/movies/daily`, {
      headers,
      withCredentials: true,
    })

    return response.data
  } catch (err: unknown) {
    console.error("Error details:", err)

    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인하세요.",
      )
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}
// http://localhost:8080/api/v1/screening?date=날짜&spotName=극장

export const fetchSpotAndDate = async (spot: string, date: string, movie_id: number) => {
  if (spot == undefined) return
  if (date == undefined) return
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    const response = await axios.get(
      `${API_BASE_URL}/v1/screening/simple?date=${date}&spotName=${spot}&movieId=${movie_id}`,
      {
        headers,
        withCredentials: true,
      },
    )

    return response.data
  } catch (err: unknown) {
    console.error("Error details:", err)

    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인하세요.",
      )
      // console.log(
      //   err.response?.data?.message ||
      //     "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인하세요."
      // );
    } else if (err instanceof Error) {
      throw new Error(err.message)
      // console.log(
      //   err.message || "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인하세요."
      // );
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
      // console.log(
      //   "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인��세요."
      // );
    }
  }
}

export const fetchSeat = async (screening_id: number) => {
  if (screening_id === undefined) return
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    const response = await axios.get(`${API_BASE_URL}/v1/screening/${screening_id}/seats`, {
      headers,
      withCredentials: true,
    })

    return response.data
  } catch (err: unknown) {
    console.error("Error details:", err)

    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인하세요.",
      )
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}


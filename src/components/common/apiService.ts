"server client"

import axios from "@/lib/axios-config";

const API_BASE_URL = "https://hs-cinemagix.duckdns.org/api"
// const API_BASE_URL = "http://localhost:8080/api"

// apiService 함수 수정 - 타임아웃 및 에러 처리 개선
export const apiService = async (url: string, data: object) => {
  try {
    console.log(`API 요청: ${url}`, data)

    const response = await axios.post(`${API_BASE_URL}${url}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      withCredentials: true, // CORS 관련 쿠키 전송 허용
      timeout: 10000, // 10초 타임아웃 설정
    })

    console.log(`API 응답: ${url}`, response.data)
    return response.data
  } catch (err: unknown) {
    console.error(`API 오류: ${url}`, err)

    if (axios.isAxiosError(err)) {
      // 타임아웃 오류
      if (err.code === "ECONNABORTED") {
        throw new Error("서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.")
      }

      // 네트워크 오류
      if (!err.response) {
        throw new Error("서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.")
      }

      // 서버 오류 응답
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인하세요."
      throw new Error(errorMessage)
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

// 마이페이지에서 내가 찜한 극장 목록 가져오기 API
export async function updateMyTheater(userId: number, mySpotList: number[]) {
  const spotListParam = mySpotList.join(",");
  const url = `https://hs-cinemagix.duckdns.org/api/v1/detail/update/myTheater?user_id=${userId}&mySpotList=${spotListParam}`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}

export async function getMyTheater(userId: number) {
  const url = `https://hs-cinemagix.duckdns.org/api/v1/detail/retrieve/myTheater?user_id=${userId}`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}

// 영화 데이터 가져오기 API
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

// 상영 정보 가져오기 API
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
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
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

// 주문 생성 API 함수 추가
export const createOrder = async (orderData: { userId: number; screeningId: number; seatIds: number[] }) => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await axios.post(`${API_BASE_URL}/v1/orders`, orderData, {
      headers,
      withCredentials: true,
    })

    return response.data
  } catch (err: unknown) {
    console.error("주문 생성 오류:", err)

    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message)
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}

// 결제 요청 API 함수 수정 - body에 orderId만 포함
export const requestPayment = async (orderId: number) => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    // 결제 요청 API 호출
    const response = await axios.post(
      `${API_BASE_URL}/v1/payment/request`,
      { orderId },
      {
        headers,
        withCredentials: true,
      },
    )

    // 응답 전체 로깅
    console.log("결제 요청 API 응답 전체:", response)
    console.log("결제 요청 API 응답 데이터:", response.data)

    // 응답 데이터가 문자열인 경우 파싱 시도
    let paymentData = response.data
    if (typeof paymentData === "string") {
      try {
        paymentData = JSON.parse(paymentData)
        console.log("문자열에서 파싱된 결제 데이터:", paymentData)
      } catch (e) {
        console.error("결제 응답 문자열 파싱 실패:", e)
      }
    }

    // 응답 데이터 직접 반환
    return paymentData
  } catch (err: unknown) {
    console.error("결제 요청 오류:", err)

    if (axios.isAxiosError(err)) {
      console.error("상세 오류 응답:", err.response?.data)
      console.error("상태 코드:", err.response?.status)
      console.error("헤더:", err.response?.headers)
      throw new Error(err.response?.data?.message || "결제 요청 중 오류가 발생했습니다. 서버 연결을 확인해주세요.")
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}

// 주문 취소 API 함수 수정 - PUT 메서드 사용
export const cancelOrder = async (orderId: number) => {
  console.log(`cancelOrder 함수 시작: orderId=${orderId}, 타입=${typeof orderId}`)

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
      console.log("인증 토큰 추가됨")
    } else {
      console.log("인증 토큰 없음")
    }

    console.log(`주문 취소 요청 준비 완료: orderId=${orderId}, 헤더:`, headers)

    // 요청 URL과 본문 로깅
    const url = `${API_BASE_URL}/v1/orders/cancel/${orderId}`
    const requestBody = { orderId }
    console.log("취소 요청 URL:", url)
    console.log("취소 요청 본문:", requestBody)

    // PUT 메서드로 요청
    const response = await axios.put(url, requestBody, { headers, withCredentials: true })

    console.log("주문 취소 응답:", response.data)
    return response.data
  } catch (err: unknown) {
    console.error("주문 취소 오류:", err)

    if (axios.isAxiosError(err)) {
      console.error("상세 오류 응답:", err.response?.data)
      console.error("상태 코드:", err.response?.status)
      console.error("헤더:", err.response?.headers)
      throw new Error(err.response?.data?.message || "주문 취소 중 오류가 발생했습니다. 서버 연결을 확인해주세요.")
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}

// 결제 상태 확인 API 함수 추가
export const checkPaymentStatus = async (orderId: number) => {
  try {
    console.log(`checkPaymentStatus 함수 시작: orderId=${orderId}`)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
      console.log("인증 토큰 추가됨")
    } else {
      console.log("인증 토큰 없음")
    }

    // 사용자 정보 가져오기
    let userId = null
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")
    console.log("로컬 스토리지 user 데이터:", userStr)

    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        userId = userData.user_id || userData.id
        console.log("user 객체에서 찾은 userId:", userId)
      } catch (e) {
        console.error("user 데이터 파싱 오류:", e)
      }
    }

    if (!userId) {
      console.error("사용자 ID를 찾을 수 없습니다. 로컬 스토리지 키:", Object.keys(localStorage))

      return {
        success: false,
        status: "ERROR",
        message: "사용자 정보를 찾을 수 없습니다.",
      }
    }

    console.log(`사용자 ID ${userId}의 주문 목록 조회 중...`)

    // 사용자의 모든 주문 조회
    const response = await axios.get(`${API_BASE_URL}/v1/orders/user/${userId}`, {
      headers,
      withCredentials: true,
    })

    console.log("사용자 주문 목록 응답:", response.data)

    // 주문 목록에서 현재 주문 ID와 일치하는 주문 찾기
    const currentOrder = response.data.find((order: any) => order.id === orderId)

    if (!currentOrder) {
      console.error(`주문 ID ${orderId}를 찾을 수 없습니다.`)
      return {
        success: false,
        status: "NOT_FOUND",
        message: "주문 정보를 찾을 수 없습니다.",
      }
    }

    console.log(`주문 ID ${orderId}의 상태:`, currentOrder.status)

    // 주문 상태 확인 - status 필드가 "PAID"인지 확인
    return {
      success: currentOrder.status === "PAID",
      status: currentOrder.status,
      message: `주문 상태: ${currentOrder.status}`,
      orderData: currentOrder,
    }
  } catch (err: unknown) {
    console.error("결제 상태 확인 오류:", err)

    if (axios.isAxiosError(err)) {
      console.error("API 오류 상세:", err.response?.data)
      console.error("상태 코드:", err.response?.status)
    }

    // 오류 발생 시 실패 응답 반환
    return {
      success: false,
      status: "ERROR",
      message: "결제 상태를 확인할 수 없습니다. 결제가 완료되지 않았습니다.",
    }
  }
}

// AI 추천 영화 불러오기 API
export const fetchAIRecommendedMovies = async (userId: number) => {
  if (!userId) return []

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }


    const response = await axios.get(`${API_BASE_URL}/v1/AIRecommand/getByUser?userId=${userId}`, {
      headers,
      withCredentials: true,
    })



    /*
    const response = await axios.get(
      `${API_BASE_URL}/v1/AIRecommand/getByUser?userId=${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          
        },
        withCredentials: true,
      }
    );
    */



    return response.data
  } catch (err: unknown) {
    console.error("AI 추천 영화 가져오기 오류:", err)

    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "AI 추천 영화를 불러오는 중 오류가 발생했습니다.")
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}

// AI 추천 영화 새로고침 API
export const refreshAIRecommendedMovies = async (userId: number, type: string) => {
  if (!userId) return []

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    }

    /*
    const response = await axios.post(`${API_BASE_URL}/v1/AIRecommand/synopsisV2?userId=${userId}&type=${type}`, {
      headers,
      withCredentials: true,
    })
    */

    const response = await axios.post(
      `${API_BASE_URL}/v1/AIRecommand/synopsisV2?userId=${userId}&type=${type}`,
      {},
      {
        headers,
        withCredentials: true,
      }
    );

    return response.data
  } catch (err: unknown) {
    console.error("AI 추천 영화 새로고침 오류:", err)

    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "AI 추천 영화를 새로고침하는 중 오류가 발생했습니다.")
    } else if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.")
    }
  }
}

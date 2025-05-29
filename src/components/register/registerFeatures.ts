import axios from "@/lib/axios-config";
import { apiService } from "../common/apiService"

// 이메일 인증 코드 전송 함수
export const sendVerificationCode = async (email: string): Promise<{ success: boolean; message: string }> => {
  // 이메일 형식 검증
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      message: "이메일 형식이 올바르지 않습니다.",
    }
  }

  try {
    const response = await axios.post("https://hs-cinemagix.duckdns.org/api/v1/user/verifyEmail", { email })

    console.log("인증 코드 전송 응답:", response.data)

    // 백엔드 응답이 문자열 "SUCCESS"인 경우 처리
    if (response.data === "SUCCESS") {
      return {
        success: true,
        message: "인증 코드가 이메일로 전송되었습니다.",
      }
    }

    // 명시적인 실패 응답이 있는 경우
    if (response.data.message) {
      return {
        success: false,
        message: response.data.message,
      }
    }

    // 기본 실패 메시지
    return {
      success: false,
      message: "인증 코드 전송에 실패했습니다. 다시 시도해주세요.",
    }
  } catch (error: any) {
    console.error("인증 코드 전송 오류:", error)
    return {
      success: false,
      message: error.response?.data?.message || error.message || "인증 코드 전송 중 오류가 발생했습니다.",
    }
  }
}

// 이메일 인증 코드 확인 함수
export const verifyEmailCode = async (email: string, authnum: string): Promise<{ success: boolean; message: string }> => {
  try {
    // 백엔드 API 요청 시 code 파라미터 이름을 authnum으로 변경
    const response = await axios.post("https://hs-cinemagix.duckdns.org/api/v1/user/check", { email, authnum })

    console.log("인증 코드 확인 응답:", response.data)

    // 백엔드 응답이 문자열 "SUCCESS"인 경우 처리
    if (response.data === "SUCCESS") {
      return {
        success: true,
        message: "이메일 인증이 완료되었습니다.",
      }
    }

    // 명시적인 실패 응답이 있는 경우
    if (response.data.message) {
      return {
        success: false,
        message: response.data.message,
      }
    }

    // 기본 실패 메시지
    return {
      success: false,
      message: "인증 코드가 올바르지 않습니다. 다시 확인해주세요.",
    }
  } catch (error: any) {
    console.error("인증 코드 확인 오류:", error)
    console.error("상세 오류:", error.response?.data || "상세 정보 없음")

    return {
      success: false,
      message: error.response?.data?.message || error.message || "인증 코드 확인 중 오류가 발생했습니다.",
    }
  }
}

/**
 * 회원가입 요청
 * @param userData 사용자 데이터 (이메일, 이름, 비밀번호)
 * @returns 응답 데이터
 */
export const registerUser = async (userData: {
  email: string
  username: string
  password: string
}) => {
  try {
    return await apiService("/v1/user/createUser", userData)
  } catch (error) {
    throw error
  }
}

/**
 * 비밀번호 일치 확인
 * @param password 비밀번호
 * @param confirmPassword 비밀번호 확인
 * @returns 일치 여부
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}
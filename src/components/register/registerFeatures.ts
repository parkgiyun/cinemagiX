import { apiService } from "../common/apiService"

/**
 * 이메일 인증 코드 전송 요청
 * @param email 사용자 이메일
 * @returns 응답 데이터
 */
export const sendVerificationCode = async (email: string) => {
  try {
    return await apiService("/v1/user/verifyEmail", { email })
  } catch (error) {
    throw error
  }
}

/**
 * 이메일 인증 코드 확인 요청
 * @param email 사용자 이메일
 * @param code 인증 코드
 * @returns 응답 데이터
 */
export const verifyEmailCode = async (email: string, code: string) => {
  try {
    const response = await apiService("/v1/user/check", {
      email,
      authnum: code,
    })
    return response
  } catch (error) {
    throw error
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
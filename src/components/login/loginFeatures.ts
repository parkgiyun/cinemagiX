import { apiService } from "../common/apiService"

/**
 * 로그인 요청을 처리하는 함수
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @returns 로그인 응답 데이터
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const data = await apiService("/v1/user/login", {
      email,
      password,
    })
    return data
  } catch (error) {
    throw error
  }
}
import { apiService } from "../common/apiService"
import React from "react"

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

/**
 * 소셜 로그인 버튼 컴포넌트 (JSX 파싱 오류 방지)
 */
export const SocialLoginButtons: React.FC = function SocialLoginButtons() {
  return React.createElement(
    "div",
    { className: "flex flex-col gap-3 my-4" },
    React.createElement(
      "a",
      {
        href: "https://hs-cinemagix.duckdns.org/oauth2/authorization/google",
        className:
          "flex items-center justify-center gap-2 border border-gray-200 rounded px-4 py-2 bg-white text-gray-800 font-medium hover:bg-gray-50 transition",
        rel: "noopener noreferrer",
        target: "_blank",
      },
      React.createElement("img", {
        src: "/google.svg",
        alt: "Google",
        className: "w-5 h-5",
      }),
      "구글로 로그인"
    ),
    React.createElement(
      "a",
      {
        href: "https://hs-cinemagix.duckdns.org/oauth2/authorization/kakao",
        className:
          "flex items-center justify-center gap-2 border border-yellow-300 rounded px-4 py-2 bg-[#fee500] text-[#3c1e1e] font-medium hover:bg-yellow-200 transition",
        rel: "noopener noreferrer",
        target: "_blank",
      },
      React.createElement("img", {
        src: "/kakao.svg",
        alt: "Kakao",
        className: "w-5 h-5",
      }),
      "카카오로 로그인"
    )
  )
}
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

// 소셜 로그인 콜백 처리: 로그인 성공 시 홈페이지로 리다이렉트 및 사용자 정보 저장
if (typeof window !== "undefined") {
  // 구글/카카오 소셜 로그인 콜백 URL 패턴에 대응
  const pathname = window.location.pathname
  const isSocialLoginCallback =
    pathname.startsWith("/login/oauth2/code/google") ||
    pathname.startsWith("/login/oauth2/code/kakao")

  if (isSocialLoginCallback) {
    // 서버에서 사용자 정보가 window.__SOCIAL_LOGIN_USER__로 전달된다고 가정 (SSR/템플릿에서 주입)
    let userData = null
    try {
      userData = (window as any).__SOCIAL_LOGIN_USER__
    } catch (e) {}
    if (!userData) {
      try {
        const el = document.getElementById("social-login-user-json")
        if (el) userData = JSON.parse(el.textContent || "")
      } catch (e) {}
    }
    // 만약 위 방식으로도 userData가 없으면, 응답 메시지에서 직접 파싱 시도 (예: 서버가 JSON을 렌더링)
    if (!userData) {
      try {
        // body에 JSON이 그대로 노출된 경우 파싱 시도
        const pre = document.querySelector("pre")
        if (pre) {
          const raw = pre.textContent || ""
          const parsed = JSON.parse(raw)
          if (parsed && parsed.data && parsed.data.user_id) {
            userData = parsed.data
          }
        }
      } catch (e) {}
    }
    if (userData && userData.user_id) {
      localStorage.setItem("user", JSON.stringify(userData))
      sessionStorage.setItem("user", JSON.stringify(userData))
    }
    // 홈으로 이동
    window.location.replace("/")
  }
}
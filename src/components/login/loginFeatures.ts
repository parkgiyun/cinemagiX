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

if (typeof window !== "undefined") {
  // 구글/카카오 소셜 로그인 콜백 URL 패턴에 대응
  const href = window.location.href
  const isSocialLoginCallback =
    href.includes("/login/oauth2/code/google") ||
    href.includes("/login/oauth2/code/kakao")

  console.log("isSocialLoginCallback(href):", isSocialLoginCallback, href)
  if (isSocialLoginCallback) {
    // F12 개발자도구에서 응답 메시지와 쿠키가 보이는 경우, 응답 메시지가 <pre> 태그에 노출되는 경우가 많음
    let userData = null
    try {
      // <pre> 태그에서 JSON 응답 추출
      const pre = document.querySelector("pre")
      if (pre) {
        const raw = pre.textContent || ""
        const parsed = JSON.parse(raw)
        if (parsed && parsed.data && parsed.data.user_id) {
          userData = parsed.data
        }
      }
    } catch (e) {}
    // userData가 있으면 localStorage/sessionStorage에 저장
    if (userData && userData.user_id) {
      localStorage.setItem("user", JSON.stringify(userData))
      sessionStorage.setItem("user", JSON.stringify(userData))
    }
    // 홈으로 이동
    window.location.replace("/")
  }
}
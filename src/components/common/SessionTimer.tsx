"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { logout } from "../dashboard/dashboardFeatures"

interface SessionTimerProps {
  timeoutMinutes: number // 세션 타임아웃 시간(분)
  children?: React.ReactNode
}

/**
 * 세션 타이머 컴포넌트
 * 지정된 시간 동안 사용자 활동이 없으면 자동으로 로그아웃합니다.
 */
export default function SessionTimer({ timeoutMinutes = 10, children }: SessionTimerProps) {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutDuration = timeoutMinutes * 60 * 1000 // 분을 밀리초로 변환

  // 타이머 리셋 함수
  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 로그인 상태인 경우에만 타이머 설정
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (token) {
      timeoutRef.current = setTimeout(() => {
        console.log("세션 타임아웃: 자동 로그아웃")
        handleLogout()
      }, timeoutDuration)
    }
  }

  // 로그아웃 처리 함수
  const handleLogout = () => {
    logout()
    // 로그아웃 메시지 표시 (선택사항)
    alert("장시간 활동이 없어 자동으로 로그아웃되었습니다.")
    // 로그인 페이지로 리다이렉트
    router.push("/login")
  }

  // 컴포넌트 마운트 시 타이머 설정
  useEffect(() => {
    // 초기 타이머 설정
    resetTimer()

    // 사용자 활동 이벤트 리스너 등록
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    // 이벤트 발생 시 타이머 리셋
    const resetTimerOnActivity = () => resetTimer()

    // 모든 이벤트에 리스너 추가
    events.forEach((event) => {
      window.addEventListener(event, resetTimerOnActivity)
    })

    // 컴포넌트 언마운트 시 정리
    return () => {
      // 타이머 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 이벤트 리스너 제거
      events.forEach((event) => {
        window.removeEventListener(event, resetTimerOnActivity)
      })
    }
  }, [timeoutDuration])

  // 로그인 상태 변경 감지
  useEffect(() => {
    // 로컬 스토리지 변경 이벤트 리스너
    const handleStorageChange = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (token) {
        resetTimer()
      } else if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return <>{children}</>
}

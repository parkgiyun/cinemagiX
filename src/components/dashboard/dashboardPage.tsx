"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { DashboardContent } from "./dashboardUI"
import { type UserData, logout, getUserProfile } from "./dashboardFeatures"

export default function DashboardPage() {
  const router = useRouter()
  // 상태 관리 부분 수정
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // 사용자 정보 업데이트 함수 추가
  const updateUserInfo = (field: string, value: string) => {
    if (user) {
      const updatedUser = { ...user, [field]: value }
      setUser(updatedUser)

      // 로컬 스토리지와 세션 스토리지 업데이트
      localStorage.setItem("user", JSON.stringify(updatedUser))
      sessionStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      try {
        // 여러 소스에서 토큰 확인
        const localToken = localStorage.getItem("token")
        const sessionToken = sessionStorage.getItem("token")
        const cookieToken = getCookie("auth_token")

        const token = localToken || sessionToken || cookieToken

        console.log("대시보드 - 토큰 확인:", {
          localToken: !!localToken,
          sessionToken: !!sessionToken,
          cookieToken: !!cookieToken,
        })

        if (!token) {
          console.error("토큰이 없어 로그인 페이지로 이동합니다.")
          router.push("/login")
          return
        }

        // 토큰이 있으면 다시 저장 (다른 스토리지에도 복제)
        if (token) {
          if (!localToken) localStorage.setItem("token", token)
          if (!sessionToken) sessionStorage.setItem("token", token)
          if (!cookieToken) document.cookie = `auth_token=${token}; path=/; max-age=86400`
        }

        // 사용자 정보 확인
        const storedUser = getUserProfile()
        console.log("대시보드 - 사용자 정보 확인:", storedUser)

        if (storedUser) {
          // userDetailDTO 형식으로 저장된 경우 처리
          if (storedUser.userDetailDTO) {
            const updatedUser = {
              email: storedUser.userDetailDTO.email,
              username: storedUser.userDetailDTO.username,
              user_id: storedUser.userDetailDTO.user_id,
            }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            sessionStorage.setItem("user", JSON.stringify(updatedUser))
            setUser(updatedUser)
          } else {
            setUser(storedUser)
          }
          setLoading(false)
        } else {
          // 사용자 정보가 없으면 로그인 페이지로 이동
          alert("로그인 후 이용 가능합니다.")
          router.push("/login")
        }
      } catch (error) {
        console.error("인증 확인 중 오류:", error)
        // 오류 발생 시 로그인 페이지로 이동
        router.push("/login")
      }
    }

    // 쿠키에서 값 가져오는 함수
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null
      return null
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // DashboardContent에 updateUserInfo 함수 전달
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <DashboardContent user={user} onLogout={handleLogout} onUpdateUser={updateUserInfo} />
    </div>
  )
}


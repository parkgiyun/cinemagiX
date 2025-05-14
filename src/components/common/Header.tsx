"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogOut, Menu, X } from "lucide-react"
import { logout } from "../dashboard/dashboardFeatures"
import { useRouter } from "next/navigation"

interface HeaderProps {
  activePage?: "home" | "login" | "register" | "dashboard" | "movie" | "reservation"
}

export const Header = ({ activePage = "home" }: HeaderProps) => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user")

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr)
          setIsLoggedIn(true)
          setUsername(userData.username || "사용자")
        } catch (error) {
          console.error("사용자 정보 파싱 오류:", error)
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }

    checkLoginStatus()
  }, [])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setUsername("")
    setIsMobileMenuOpen(false)
    router.refresh() // 페이지 새로고침
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <header className="site-header">
        <div className="site-container flex justify-between items-center" style={{ marginTop: "16px" }}>
          <Link href="/" className="site-name font-bold">
            CinemagiX
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden sm:flex desktop-nav">
            {isLoggedIn ? (
              <>
                <span className="nav-link">
                  <span className="text-primary font-medium">{username}</span>님 환영합니다
                </span>
                <Link href="/dashboard" className={`nav-link ${activePage === "dashboard" ? "active" : ""}`}>
                  <span className="bg-primary text-white px-2 py-1 text-xs rounded">마이페이지</span>
                </Link>
                <button onClick={handleLogout} className="nav-link flex items-center text-gray-600 hover:text-primary">
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`nav-link ${activePage === "login" ? "active" : ""}`}>
                  로그인
                </Link>
                <Link href="/register" className={`nav-link ${activePage === "register" ? "active" : ""}`}>
                  회원가입
                </Link>
                <Link href="/dashboard" className={`nav-link ${activePage === "dashboard" ? "active" : ""}`}>
                  <span className="bg-primary text-white px-2 py-1 text-xs rounded">마이페이지</span>
                </Link>
              </>
            )}
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button className="mobile-menu-button sm:hidden" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="site-container">
          {isLoggedIn ? (
            <>
              <span className="nav-link block py-2">
                <span className="text-primary font-medium">{username}</span>님 환영합니다
              </span>
              <Link
                href="/dashboard"
                className={`nav-link block py-2 ${activePage === "dashboard" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="bg-primary text-white px-2 py-1 text-xs rounded">마이페이지</span>
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link with-icon block w-full text-left py-2 text-gray-600 hover:text-primary"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`nav-link block py-2 ${activePage === "login" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                로그인
              </Link>
              <Link
                href="/register"
                className={`nav-link block py-2 ${activePage === "register" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                회원가입
              </Link>
              <Link
                href="/dashboard"
                className={`nav-link block py-2 ${activePage === "dashboard" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="bg-primary text-white px-2 py-1 text-xs rounded">마이페이지</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

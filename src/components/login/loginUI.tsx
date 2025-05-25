"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../common/Button"
import { ErrorAlert } from "../common/ErrorAlert"
import Link from "next/link"
import { Header } from "../common/Header"
import { SocialLoginButtons } from "../login/loginFeatures"

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  error: string
  loading: boolean
}

export const LoginForm = ({ onSubmit, error, loading }: LoginFormProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <div className="min-h-screen flex flex-col w-full" style={{ marginTop: "-16px" }}> {/* homeUI와 맞추기 위한 -16px */}
      {/* 공통 헤더 사용 */}
      <Header activePage="login" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="auth-container bg-white p-8 rounded-lg shadow-sm">
          <h2 className="auth-title">
            회원 서비스 이용을 위해
            <br />
            로그인이 필요합니다.
          </h2>

          <ErrorAlert message={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  id="email"
                  placeholder="이메일을 입력하세요."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <input
                  type="password"
                  id="password"
                  placeholder="비밀번호를 입력하세요."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3"
              loading={loading}
              loadingText="로그인 중..."
            >
              로그인
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              계정이 없으신가요?{" "}
              <Link href="/register" className="text-primary hover:underline">
                회원가입
              </Link>
            </p>
          </div>

          {/* 소셜 로그인 버튼 추가 */}
          <div className="mt-6">
            <SocialLoginButtons />
          </div>
        </div>
      </div>
    </div>
  )
}

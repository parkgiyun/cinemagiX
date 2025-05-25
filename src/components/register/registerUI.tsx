"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../common/Button"
import { ErrorAlert } from "../common/ErrorAlert"
import Link from "next/link"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Header } from "../common/Header"
import { SocialLoginButtons } from "../login/loginFeatures"

interface RegisterFormData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

interface RegisterFormProps {
  onSubmit: (data: Omit<RegisterFormData, "confirmPassword">) => Promise<void>
  onSendVerification: (email: string) => Promise<void>
  onVerifyCode: (email: string, code: string) => Promise<void>
  error: string
  loading: boolean
  verificationSent: boolean
  verificationSuccess: boolean
  verificationLoading: boolean
}

export const RegisterForm = ({
  onSubmit,
  onSendVerification,
  onVerifyCode,
  error,
  loading,
  verificationSent,
  verificationSuccess,
  verificationLoading,
}: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [verificationCode, setVerificationCode] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { confirmPassword, ...userData } = formData
    await onSubmit(userData)
  }

  const handleSendVerification = async (e: React.MouseEvent) => {
    e.preventDefault()
    await onSendVerification(formData.email)
  }

  const handleVerifyCode = async (e: React.MouseEvent) => {
    e.preventDefault()
    await onVerifyCode(formData.email, verificationCode)
  }

  return (
    <div className="min-h-screen flex flex-col w-full" style={{ marginTop: "-16px" }}> {/* homeUI와 맞추기 위한 -16px */}
      {/* 공통 헤더 사용 */}
      <Header activePage="register" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="auth-container bg-white p-8 rounded-lg shadow-sm">
          <h2 className="auth-title">회원가입</h2>
          <p className="text-center text-gray-500 mb-6">이메일 인증 후 회원가입을 완료하세요.</p>

          <ErrorAlert message={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="이메일을 입력하세요."
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={verificationSent}
                    className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={verificationLoading || (verificationSent && verificationSuccess) || !formData.email}
                    className="whitespace-nowrap bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  >
                    {verificationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : verificationSent && !verificationSuccess ? (
                      "재전송"
                    ) : verificationSuccess ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      "인증코드 전송"
                    )}
                  </Button>
                </div>
              </div>

              {verificationSent && !verificationSuccess && (
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                    인증 코드
                  </label>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <input
                      type="text"
                      id="verificationCode"
                      placeholder="인증 코드를 입력하세요."
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={verificationLoading || !verificationCode}
                      className="whitespace-nowrap bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    >
                      {verificationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "확인"}
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="이름을 입력하세요."
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요."
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="비밀번호를 다시 입력하세요."
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 mt-6"
              disabled={loading || !verificationSuccess}
              loading={loading}
              loadingText="회원가입 중..."
            >
              회원가입
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary hover:underline">
                로그인
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

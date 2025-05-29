"use client"
import axios from "@/lib/axios-config";

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RegisterForm } from "./registerUI"
import { registerUser, sendVerificationCode, verifyEmailCode } from "./registerFeatures"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)

  const handleRegister = async (userData: { email: string; username: string; password: string }) => {
    if (!verificationSuccess) {
      setError("이메일 인증을 완료해주세요.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await registerUser(userData)

      // 회원가입 정보 로컬 스토리지에 저장 (개발 편의성)
      try {
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "{}")
        registeredUsers[userData.email] = userData.username
        localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
      } catch (e) {
        console.error("회원가입 정보 저장 실패:", e)
      }

      alert("회원가입이 완료되었습니다! 로그인 페이지로 돌아갑니다.")
      router.push("/login?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSendVerification = async (email: string) => {
    if (!email) {
      setError("이메일을 입력해주세요.")
      return
    }

    setVerificationLoading(true)
    setError("")

    try {
      // 대시보드와 동일하게 axios로 직접 호출
      const response = await axios.post("https://hs-cinemagix.duckdns.org/api/v1/user/verifyEmail", { email })
      if (response.data === "SUCCESS") {
        setVerificationSent(true)
      } else {
        setError("인증 코드 전송에 실패했습니다.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증 코드 전송 중 오류가 발생했습니다.")
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleVerifyCode = async (email: string, authnum: string) => {
    if (!authnum) {
      setError("인증 코드를 입력해주세요.")
      return
    }

    setVerificationLoading(true)
    setError("")

    try {
      // 대시보드와 동일하게 axios로 직접 호출
      const response = await axios.post("https://hs-cinemagix.duckdns.org/api/v1/user/check", { email, authnum })
      if (response.data === "SUCCESS") {
        setVerificationSuccess(true)
      } else {
        setError("인증 코드가 올바르지 않습니다.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증 코드 확인 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setVerificationLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <RegisterForm
        onSubmit={handleRegister}
        onSendVerification={handleSendVerification}
        onVerifyCode={handleVerifyCode}
        error={error}
        loading={loading}
        verificationSent={verificationSent}
        verificationSuccess={verificationSuccess}
        verificationLoading={verificationLoading}
      />
    </div>
  )
}


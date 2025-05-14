import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("회원 탈퇴 요청:", { email })

    // 요청에서 토큰 추출
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    if (!email) {
      return NextResponse.json({ success: false, message: "이메일 정보가 필요합니다." }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ success: false, message: "비밀번호가 필요합니다." }, { status: 400 })
    }

    // 스프링부트 API 요청 데이터 구성
    const requestData = {
      email: email,
      password: password,
    }

    console.log("스프링부트 API 회원 탈퇴 요청 데이터:", {
      email: requestData.email,
      hasPassword: !!requestData.password,
    })

    // 스프링부트 API 호출
    const springResponse = await axios.post("https://hs-cinemagix.duckdns.org/api/v1/user/deleteAccount", requestData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("스프링부트 API 응답:", springResponse.data)

    return NextResponse.json(springResponse.data)
  } catch (error: any) {
    console.error("API 라우트 오류:", error.message)
    console.error("상세 오류:", error.response?.data || "상세 정보 없음")

    return NextResponse.json(
      {
        success: false,
        code: "ERROR",
        message: error.response?.data?.message || "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    )
  }
}

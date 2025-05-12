import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { field, value, currentPassword, email, user_id } = body

    console.log("사용자 정보 업데이트 요청:", {
      field,
      valueLength: value ? value.length : 0,
      email,
      hasPassword: !!currentPassword,
      hasNewPassword: field === "password" ? !!value : "N/A",
    })

    // 요청에서 토큰 추출
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    if (!currentPassword) {
      return NextResponse.json({ success: false, message: "비밀번호가 필요합니다." }, { status: 400 })
    }

    // 비밀번호 변경 시 새 비밀번호 확인
    if (field === "password" && !value) {
      return NextResponse.json({ success: false, message: "새 비밀번호가 필요합니다." }, { status: 400 })
    }

    // 스프링부트 API 요청 데이터 구성
    // 새로운 API 엔드포인트 형식에 맞게 데이터 구성
    const requestData = {
      user_id: user_id,
      password: currentPassword,
      after: value,
    }

    // 필드에 따라 다른 API 엔드포인트 사용
    let apiEndpoint = ""
    if (field === "username") {
      apiEndpoint = "https://hs-cinemagix.duckdns.org/api/v1/detail/change/username"
    } else if (field === "password") {
      apiEndpoint = "https://hs-cinemagix.duckdns.org/api/v1/detail/change/password"
    } else if (field === "email") {
      apiEndpoint = "https://hs-cinemagix.duckdns.org/api/v1/detail/change/email"
    } else {
      return NextResponse.json({ success: false, message: "지원하지 않는 필드입니다." }, { status: 400 })
    }

    console.log("스프링부트 API 요청 데이터:", {
      endpoint: apiEndpoint,
      user_id: requestData.user_id,
      hasPassword: !!requestData.password,
      afterLength: requestData.after ? requestData.after.length : 0,
    })

    // 스프링부트 API 호출
    const springResponse = await axios.post(apiEndpoint, requestData, {
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
        message: error.response?.data?.message || "현재 비밀번호가 일치하지 않습니다.",
      },
      { status: 500 },
    )
  }
}

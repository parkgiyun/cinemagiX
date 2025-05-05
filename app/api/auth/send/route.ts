import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    console.log("이메일 인증 코드 전송 요청:", email)

    try {
      const springResponse = await axios.post(
        "http://localhost:8080/api/v1/email/send",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        },
      )

      console.log("Spring Boot 서버 응답:", springResponse.data)

      // 성공 응답 반환
      return NextResponse.json(springResponse.data)
    } catch (error: any) {
      console.error("Spring Boot 서버 연결 실패:", error.message)
      console.error("상세 오류:", error.response?.data || "상세 정보 없음")

      // 오류 응답 반환
      return NextResponse.json(
        {
          success: false,
          code: "ERROR",
          message: "서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API 라우트 오류:", error)
    return NextResponse.json(
      {
        success: false,
        code: "ERROR",
        message: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    )
  }
}


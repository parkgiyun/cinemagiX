import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("로그인 요청:", { email })

    try {
      const springResponse = await axios.post(
        "http://localhost:8080/api/v1/user/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        },
      )

      console.log("Spring Boot 서버 응답:", springResponse.data)

      // 스프링부트 서버 응답에 사용자 이름이 없는 경우 추가 부분 수정
      // 이제 userDetailDTO 객체에서 사용자 정보를 확인
      if (springResponse.data.code === "SUCCESS" && springResponse.data.userDetailDTO) {
        // 응답 구조 유지
        console.log("사용자 정보:", springResponse.data.userDetailDTO)
      }

      return NextResponse.json(springResponse.data)
    } catch (error: any) {
      console.error("Spring Boot 서버 연결 실패:", error.message)

      // 서버 연결 실패 시 오류 응답
      return NextResponse.json(
        {
          success: false,
          code: "ERROR",
          message: "서버 연결에 실패했습니다.",
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


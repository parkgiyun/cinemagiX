import { NextResponse } from "next/server"
import axios from "@/lib/axios-config";

export async function GET() {
  try {
    const response = await axios.get("https://hs-cinemagix.duckdns.org/api/v1/movies/daily", {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error("영화 데이터 가져오기 오류:", error.message)

    // 에러 응답의 상세 정보 로깅
    if (error.response) {
      console.error("에러 응답 상태:", error.response.status)
      console.error("에러 응답 데이터:", error.response.data)
      console.error("에러 응답 헤더:", error.response.headers)
    }

    return NextResponse.json({ error: "영화 데이터를 가져오는데 실패했습니다." }, { status: 500 })
  }
}

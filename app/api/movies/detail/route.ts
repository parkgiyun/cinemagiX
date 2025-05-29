import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "영화 ID가 필요합니다." }, { status: 400 })
    }

    // 이 부분은 서버 컴포넌트에서 Redux를 직접 사용할 수 없으므로
    // 실제 구현에서는 데이터베이스나 다른 방식으로 영화 정보를 가져와야 합니다.
    // 여기서는 예시로 직접 API 호출을 통해 영화 목록을 가져옵니다.

    const response = await fetch("https://hs-cinemagix.duckdns.org/api/v1/movies/daily", {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        withCredentials: "true", // 쿠키를 포함하기 위해 필요
      },
    })

    if (!response.ok) {
      throw new Error("영화 목록을 가져오는데 실패했습니다.")
    }

    const movies = await response.json()
    const movie = movies.find((m: any) => m.id === Number(id))

    if (!movie) {
      return NextResponse.json({ error: "영화를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(movie)
  } catch (error: any) {
    console.error("영화 상세 정보 API 오류:", error.message)
    return NextResponse.json({ error: "영화 정보를 가져오는데 실패했습니다." }, { status: 500 })
  }
}

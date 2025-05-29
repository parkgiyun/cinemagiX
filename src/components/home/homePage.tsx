"use client"

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HomeContent } from "./homeUI";
import { Suspense } from "react";

function SocialAutoLogin() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const isSocial = params.get("social") === "1";
    // 새로고침 플래그를 localStorage로 관리하여 1회만 새로고침
    if (isSocial && !localStorage.getItem("socialLoginRefreshed")) {
      fetch("https://hs-cinemagix.duckdns.org/api/v1/user/me", {
        method: "POST",
        credentials: "include",
      })
        .then(res => {
          if (!res.ok) throw new Error("Auth failed");
          return res.json();
        })
        .then(user => {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("socialLoginRefreshed", "true");
          alert("⚠️ 소셜 로그인은 초기 비밀번호가 1234로 설정되어 있습니다. 마이페이지 > 보안 탭에서 변경하는 것을 권장합니다.")
          window.location.replace("/"); // 새로고침
        })
    } else if (!isSocial) {
      // 소셜 로그인 쿼리가 없으면 플래그 제거(다음 소셜 로그인 대비)
      localStorage.removeItem("socialLoginRefreshed");
    }
  }, [params, router]);

  return null;
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <Suspense fallback={null}>
        <SocialAutoLogin />
      </Suspense>
      <HomeContent />
    </div>
  );
}
"use client"

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HomeContent } from "./homeUI";
import { Suspense } from "react";

function SocialAutoLogin() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === "undefined") return;

    const isSocial = params.get("social") === "1";
    if (isSocial) {
      setTimeout(() => {
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
            // 쿼리스트링 제거 후 홈으로 이동
            router.replace("/");
          })
          .catch(() => {
            window.location.reload();
          });
      }, 500);
    }
  // params.toString()을 deps에 추가
  }, [router, params.toString()]);

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
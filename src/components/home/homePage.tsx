"use client"

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HomeContent } from "./homeUI";

function SocialAutoLogin() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const isSocial = params.get("social") === "1";
    if (isSocial) {
      // 1. 소셜 로그인 후 JWT 토큰을 발급받는 API 호출 (예시: /api/v1/auth/social/callback)
      fetch("https://hs-cinemagix.duckdns.org/api/v1/auth/social/callback", {
        method: "POST",
        credentials: "include",
      })
        .then(res => res.json())
        .then(data => {
          // JWT 토큰 저장
          if (data.token) {
            localStorage.setItem("jwt", data.token);
            // 2. JWT 토큰을 Authorization 헤더에 포함하여 유저 정보 요청
            return fetch("https://hs-cinemagix.duckdns.org/api/v1/user/me", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${data.token}`,
                "Content-Type": "application/json",
              },
            });
          } else {
            throw new Error("No token");
          }
        })
        .then(res => res.json())
        .then(user => {
          localStorage.setItem("user", JSON.stringify(user));
          router.replace("/");
        })
        .catch(() => {
          router.push("/login");
        });
    }
  }, [params, router]);

  return null;
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <SocialAutoLogin />
      <HomeContent />
    </div>
  );
}
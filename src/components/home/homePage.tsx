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
  if (isSocial) {
    // 쿠키 적용 대기 (200ms → 500ms로 증가)
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
          router.replace("/");
        })
        .catch(() => {
          // 인증 실패 시 새로고침 시도 (쿠키 적용 보장)
          window.location.reload();
        });
    }, 500);
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
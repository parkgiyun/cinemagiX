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
    const tryLogin = (retry = false) => {
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
          // 최초 실패 시 1회만 500ms 후 재시도
          if (!retry) {
            setTimeout(() => tryLogin(true), 500);
          } else {
            window.location.reload();
          }
        });
    };
    tryLogin();
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
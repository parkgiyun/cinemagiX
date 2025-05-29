"use client"

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HomeContent } from "./homeUI";

export default function HomePage() {
  const router = useRouter();
  const params = useSearchParams();
  const isSocial = params.get("social") === "1";

  useEffect(() => {
    if (isSocial) {
      fetch("https://hs-cinemagix.duckdns.org/api/v1/user/me", {
        method: "POST",
        credentials: "include",
      })
        .then(res => res.json())
        .then(user => {
          localStorage.setItem("user", JSON.stringify(user));
          // 필요시 로그인 상태 갱신
          router.replace("/"); // 쿼리스트링 제거
        })
        .catch(() => {
          router.push("/login");
        });
    }
  }, [isSocial, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <HomeContent />
    </div>
  );
}
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
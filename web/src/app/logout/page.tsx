"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
      router.replace("/login");
    })();
  }, [router]);
  return null;
}

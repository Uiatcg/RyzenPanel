"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserData } from "@/src/types/dashboard";

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user) setUser(d.user);
        else router.push("/auth/login");
      })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false));
  }, [router]);

  return { user, loading };
}

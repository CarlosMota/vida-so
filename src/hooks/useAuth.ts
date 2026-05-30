import { useEffect, useState } from "react";
import { getAuthMeReal } from "@/lib/trpc-real";

type AuthUser = {
  id: number;
  openId: string;
  email?: string | null;
  name?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin" | "provider";
  avatarUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  lastSignedIn?: Date;
} | null;

const AUTH_CHANGED_EVENT = "vidaso:auth-changed";

export function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = () => {
    setLoading(true);
    return getAuthMeReal()
      .then((data) => {
        setUser(data ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let mounted = true;

    const safeRefresh = () => {
      void refreshAuth().catch(() => {
        if (mounted) setUser(null);
      });
    };

    safeRefresh();

    const onAuthChanged = () => {
      if (!mounted) return;
      safeRefresh();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    };
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    refreshAuth,
  };
}

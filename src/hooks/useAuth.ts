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

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void getAuthMeReal()
      .then((data) => {
        if (mounted) {
          setUser(data ?? null);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminUserFromCookie } from "@/lib/cookies";
import type { AdminUser } from "@/types";

/**
 * Custom hook for admin authentication state.
 * Reads user data from cookies (set by server-side auth).
 * No AuthContext, no Redux, no localStorage.
 */
export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const userData = getAdminUserFromCookie();
    setUser(userData);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthenticated = !!user;
  const isAdmin = user?.user_type === "admin" || user?.user_type === "Admin";

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    refreshAuth: checkAuth,
  };
}

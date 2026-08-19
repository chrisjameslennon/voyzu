"use client";

import { useEffect, useState } from "react";
import { CURRENT_USER_ACCESS_REFRESH_EVENT } from "@voyzu/auth/users/client";
import type { UserResponseDto, UserRole } from "@voyzu/auth/types";

const ROLE_RANK: Record<UserRole, number> = {
  COMPANY_USER: 1,
  ORGANIZATION_USER: 2,
  ADMIN: 3,
};

export function canAccessRole(user: UserResponseDto | null, minRole: UserRole): boolean {
  return Boolean(
    user
      && user.status === "ACTIVE"
      && (user.accessMode === "UI" || user.accessMode === "UI_AND_API")
      && ROLE_RANK[user.role] >= ROLE_RANK[minRole],
  );
}

export function useCurrentUserAccess() {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });
        if (cancelled) return;
        setUser(response.ok ? await response.json() as UserResponseDto : null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }

    void loadUser();
    const refresh = () => { void loadUser(); };
    window.addEventListener(CURRENT_USER_ACCESS_REFRESH_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(CURRENT_USER_ACCESS_REFRESH_EVENT, refresh);
    };
  }, []);

  return { user, isLoaded };
}

"use client";

import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import styles from "./user-menu.module.css";

interface UserMenuProps {
  code?: string;
  email?: string | null;
  displayName?: string;
  profileHref?: string;
  logoutUrl?: string;
}

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const UserMenu: React.FC<UserMenuProps> = ({
  code,
  email,
  displayName,
  profileHref = "/settings/users/profile",
  logoutUrl = "/api/auth/session",
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!code) return null;

  const label = displayName || code;
  const avatarLabel = initials(label) || code.slice(0, 2).toUpperCase();

  const openProfile = () => {
    setIsOpen(false);
    router.push(profileHref);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    await fetch(logoutUrl, { method: "DELETE" }).catch(() => null);
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.triggerButton}
        aria-label="Open user menu"
      >
        {avatarLabel}
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{label}</p>
            <p className={styles.userEmail}>{email || code}</p>
          </div>
          <button
            type="button"
            className={styles.menuItem}
            onClick={openProfile}
          >
            Profile
          </button>
          <button
            type="button"
            className={styles.menuItem}
            disabled={isLoggingOut}
            onClick={() => {
              void logout();
            }}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

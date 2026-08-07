"use client";

import { useEffect, useState, useCallback } from "react";

import styles from "./toast.module.css";

interface ToastProps {
  isVisible: boolean;
  onClose: () => void;
  message: string;
}

export function Toast({ isVisible, onClose, message }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [opacity, setOpacity] = useState(0);

  const handleClose = useCallback(() => {
    setOpacity(0);
    const timer = setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 600);
    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const fadeIn = setTimeout(() => setOpacity(1), 20);
      const autoClose = setTimeout(handleClose, 5000);
      return () => {
        clearTimeout(fadeIn);
        clearTimeout(autoClose);
      };
    } else if (shouldRender) {
      handleClose();
    }
  }, [isVisible, handleClose, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={styles.toast}
      style={{ opacity, transform: `translateY(${opacity === 1 ? "0" : "10px"})` }}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          <span className={`material-symbols-outlined ${styles.checkmark}`}>check</span>
        </div>
        <div className={styles.message}>{message}</div>
        <button className={styles.closeBtn} onClick={handleClose}>
          <span className={`material-symbols-outlined ${styles.closeIcon}`}>close</span>
        </button>
      </div>
    </div>
  );
}

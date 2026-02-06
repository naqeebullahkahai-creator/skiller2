import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"];

export const useAdminInactivityLogout = () => {
  const { isSuperAdmin, logout, isAuthenticated } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(async () => {
    toast.info("Session expired due to inactivity. Please log in again.");
    await logout();
    window.location.href = "/";
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) return;

    resetTimer();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isAuthenticated, isSuperAdmin, resetTimer]);
};

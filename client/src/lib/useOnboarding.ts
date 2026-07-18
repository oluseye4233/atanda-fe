import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";

// The durable "has this account ever completed a session" signal is the
// backend's `lastLogin` field on the User object — it is `null` only until
// the account's *next* login, at which point the server sets it and this
// tour never auto-opens again for that account, on any device or browser.
// This sessionStorage guard is a lightweight, session-scoped supplement: it
// only prevents the tour from reopening on an in-session refresh/navigation
// *before* that next login happens (sessionStorage clears with the tab, so
// it never outlives the session it was set in).
const SESSION_DISMISSED_PREFIX = "ark.onboarding.dismissed.";

function sessionKey(userId: string | undefined | null) {
  return userId ? `${SESSION_DISMISSED_PREFIX}${userId}` : null;
}

export function useOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  // Track which user the modal was opened for, so a `close()` triggered after
  // an account switch can never write completion under the wrong user key.
  const openedForUserId = useRef<string | null>(null);

  useEffect(() => {
    // Reset visibility whenever the auth subject changes. Logged-out → close.
    if (!isAuthenticated || !user?.id) {
      setIsOpen(false);
      openedForUserId.current = null;
      return;
    }
    // If the modal is open for a *different* user (account switch with the
    // tour still open), close it before re-evaluating for the new user.
    if (openedForUserId.current && openedForUserId.current !== user.id) {
      setIsOpen(false);
      openedForUserId.current = null;
    }
    // Only accounts that have never logged in before (lastLogin still null)
    // are candidates for the auto-opened tour.
    if (user.lastLogin !== null) return;
    const key = sessionKey(user.id);
    try {
      if (key && sessionStorage.getItem(key)) return; // already dismissed this session
    } catch {
      // sessionStorage unavailable (private mode, quota) — fall through and open.
    }
    setIsOpen(true);
    openedForUserId.current = user.id;
  }, [isAuthenticated, user?.id, user?.lastLogin]);

  const open = useCallback(() => {
    if (!user?.id) return;
    openedForUserId.current = user.id;
    setIsOpen(true);
  }, [user?.id]);

  const close = useCallback((markCompleted = true) => {
    setIsOpen(false);
    const targetUserId = openedForUserId.current;
    openedForUserId.current = null;
    if (!markCompleted || !targetUserId) return;
    const key = sessionKey(targetUserId);
    try {
      if (key) sessionStorage.setItem(key, "1");
    } catch {
      // ignore — best-effort persistence
    }
  }, []);

  return { isOpen, open, close };
}

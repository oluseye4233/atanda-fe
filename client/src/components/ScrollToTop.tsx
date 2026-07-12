import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top on every navigation, except when the
 * destination pathname is identical to the current one.
 * Mount once inside <App> — renders nothing.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathname = useRef<string>(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    prevPathname.current = pathname;
  }, [pathname]);

  return null;
}

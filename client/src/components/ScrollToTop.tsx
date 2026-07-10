import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

/**
 * Scrolls the window to the top on every navigation, except when the
 * destination pathname is identical to the current one (e.g. a same-page
 * link or a query-string change on the same route).
 *
 * Mount this once inside <App> — it renders nothing.
 */
export function ScrollToTop() {
  const [location] = useLocation();
  const prevLocation = useRef<string>(location);

  useEffect(() => {
    if (location !== prevLocation.current) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    prevLocation.current = location;
  }, [location]);

  return null;
}

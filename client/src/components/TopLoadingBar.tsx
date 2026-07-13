import { useEffect, useState } from "react";

/**
 * A slim indeterminate progress bar pinned to the top of the viewport —
 * the NProgress-style "line that fills from the left" shown while a lazy
 * code-split chunk is being fetched.
 *
 * Designed to be used as a <Suspense fallback>. It mounts when loading
 * starts, eases toward ~90% (never completing, since we don't know the real
 * progress), and unmounts the moment the chunk resolves and the real content
 * takes over.
 */
export function TopLoadingBar() {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    // Ease toward 90% with decreasing step size so it feels like real work.
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const remaining = 90 - p;
        return p + Math.max(0.5, remaining * 0.12);
      });
    }, 180);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] h-0.5 bg-transparent"
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
      data-testid="top-loading-bar"
    >
      <div
        className="h-full bg-linear-to-r from-primary via-primary to-secondary transition-[width] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 12px hsl(188 86% 53% / 0.7), 0 0 4px hsl(188 86% 53% / 0.9)",
        }}
      />
    </div>
  );
}

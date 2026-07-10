import { useEffect, useRef } from "react";

/**
 * Full-bleed canvas-based animated ASCII field.
 * A grid of characters whose brightness follows a drifting plasma wave,
 * with a slow diagonal light beam sweeping through.
 *
 * - Throttled to ~22fps to stay light on CPU.
 * - Renders a single static frame when prefers-reduced-motion is set.
 * - The parent must be positioned (relative/absolute) and sized.
 */
export function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;

    const chars = " .·:-=+*#";
    const cellW = 11;
    const cellH = 15;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let last = 0;

    const resize = () => {
      const parent = el.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      el.width = Math.max(1, Math.floor(width * dpr));
      el.height = Math.max(1, Math.floor(height * dpr));
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.font = `${cellH}px "Space Grotesk", ui-monospace, monospace`;
      context.textBaseline = "top";
      cols = Math.ceil(width / cellW);
      rows = Math.ceil(height / cellH);
    };

    const render = (time: number) => {
      const t = time * 0.001;
      context.clearRect(0, 0, width, height);

      // diagonal beam sweeping across the field
      const beamPos = ((t * 0.07) % 1.7) - 0.35;

      for (let r = 0; r < rows; r++) {
        const ny = r / rows;
        for (let c = 0; c < cols; c++) {
          const nx = c / cols;

          // drifting plasma wave
          const wave =
            0.5 +
            0.5 *
              Math.sin(nx * 7 + t * 0.5) *
              Math.cos(ny * 5 - t * 0.35 + Math.sin(t * 0.2));

          // soft diagonal light beam (gaussian falloff)
          const axis = nx * 0.55 + ny * 0.45;
          const d = axis - beamPos;
          const beam = Math.exp(-(d * d) / 0.006);

          // brighter toward the bottom, fade top edge into the copy
          let intensity = wave * 0.42 + beam * 0.85;
          intensity *= 0.15 + 0.85 * ny;

          if (intensity < 0.09) continue;

          const idx = Math.min(
            chars.length - 1,
            Math.floor(intensity * chars.length),
          );
          const ch = chars[idx];
          if (ch === " ") continue;

          const beamMix = Math.min(1, beam * 1.15);
          const alpha = Math.min(0.92, 0.1 + intensity * 0.7);

          // cyan base → white near the beam
          const rr = Math.round(70 + beamMix * 185);
          const gg = Math.round(205 + beamMix * 50);
          const bb = Math.round(220 + beamMix * 35);
          context.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
          context.fillText(ch, c * cellW, r * cellH);
        }
      }
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 45) return; // ~22fps
      last = time;
      render(time);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (el.parentElement) ro.observe(el.parentElement);

    if (prefersReduced) {
      render(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 28%, black 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 28%, black 100%)",
      }}
      aria-hidden="true"
      data-testid="hero-ascii"
    />
  );
}

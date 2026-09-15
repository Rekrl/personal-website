"use client";

// The Konami-code -> Matrix-rain easter egg (wayfinder ticket #18,
// variant B "terminal takeover"). Two equal triggers, desktop and
// mobile alike: the Konami keyboard sequence, and 5 taps within 2s on
// any element carrying `data-konami-trigger` (the homepage's "ns."
// mark). Dismisses on any key, click or tap; auto-dismisses after 8s
// as a safety net if never interacted with.

import { useCallback, useEffect, useRef, useState } from "react";
import { THEME_CHANGE_EVENT, currentTheme } from "./ThemeToggle";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

const CONFIG = {
  tapTriggerSelector: "[data-konami-trigger]",
  tapWindowMs: 2000,
  tapThreshold: 5,
  hintDelayMs: 1500,
  safetyDismissMs: 8000,
  glyphs: "アイウエオカキクケコサシスセソ0123456789$#@!<>/\\",
  palettes: {
    dark: ["#00ffff", "#ff00cc", "#00ffff"],
    light: ["#0e7490", "#be185d", "#0e7490"],
  } as Record<"dark" | "light", string[]>,
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// Mounts once per activation and manages its own theme subscription
// (same no-remount pattern as ParticleNetwork.tsx), so toggling the
// theme while the overlay is up re-colors the rain in place instead
// of restarting the animation.
function MatrixRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;
    const canvas: HTMLCanvasElement = el;
    const ctx: CanvasRenderingContext2D = context;

    let palette = CONFIG.palettes[currentTheme()];
    const fontSize = 16;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const columns = Math.max(1, Math.floor(canvas.width / fontSize));
    const drops = new Array(columns).fill(0).map(() => Math.random() * -50);

    let raf: number;
    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const glyph = CONFIG.glyphs[Math.floor(Math.random() * CONFIG.glyphs.length)];
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.fillText(glyph, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    const handleThemeChange = () => {
      palette = CONFIG.palettes[currentTheme()];
    };

    window.addEventListener("resize", resize);
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}

export default function KonamiEasterEgg() {
  const [active, setActive] = useState(false);
  const [dismissHint, setDismissHint] = useState(false);
  const progressRef = useRef(0);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const trigger = useCallback(() => {
    setDismissHint(false);
    setActive(true);
  }, []);
  const dismiss = useCallback(() => setActive(false), []);

  // Konami keyboard sequence; any key dismisses while active.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if (active) {
        dismiss();
        return;
      }

      if (e.code === KONAMI_SEQUENCE[progressRef.current]) {
        progressRef.current += 1;
        if (progressRef.current === KONAMI_SEQUENCE.length) {
          progressRef.current = 0;
          trigger();
        }
      } else {
        progressRef.current = e.code === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, dismiss, trigger]);

  // 5x tap on the trigger element within 2s; works for click and touch
  // alike. A document-level listener rather than an onClick handler on
  // the logo itself, so the logo can stay a plain server-rendered span.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (active) return; // the overlay's own click handler covers dismissal
      const target = e.target;
      if (!(target instanceof Element) || !target.closest(CONFIG.tapTriggerSelector)) return;

      tapCountRef.current += 1;
      if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
      tapTimerRef.current = window.setTimeout(() => {
        tapCountRef.current = 0;
      }, CONFIG.tapWindowMs);

      if (tapCountRef.current >= CONFIG.tapThreshold) {
        tapCountRef.current = 0;
        trigger();
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [active, trigger]);

  // Dismiss hint + safety auto-dismiss while active.
  useEffect(() => {
    if (!active) return;
    const hint = window.setTimeout(() => setDismissHint(true), CONFIG.hintDelayMs);
    const safety = window.setTimeout(dismiss, CONFIG.safetyDismissMs);
    return () => {
      window.clearTimeout(hint);
      window.clearTimeout(safety);
    };
  }, [active, dismiss]);

  // Focus management: move focus into the overlay while it's up, restore after.
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      overlayRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [active]);

  if (!active) return null;

  const reducedMotion = prefersReducedMotion();

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Easter egg: the matrix has you. Press any key or tap to dismiss."
      tabIndex={-1}
      onClick={dismiss}
      className="fixed inset-0 z-[9999] bg-black overflow-hidden cursor-pointer outline-none"
    >
      {reducedMotion ? (
        <div className="w-full h-full flex items-center justify-center text-cyan font-mono text-sm tracking-widest px-6 text-center">
          wake up, nuno_
        </div>
      ) : (
        <MatrixRainCanvas />
      )}

      <p
        className="glitch absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-2xl md:text-4xl text-cyan tracking-widest uppercase px-4 pointer-events-none"
        data-text="wake up, nuno_"
      >
        wake up, nuno_
      </p>

      {dismissHint && (
        <p className="absolute bottom-10 inset-x-0 text-center text-cyan text-xs tracking-[0.3em] uppercase px-4 pointer-events-none">
          press any key / tap to continue
        </p>
      )}
    </div>
  );
}

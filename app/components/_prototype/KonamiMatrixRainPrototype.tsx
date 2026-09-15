"use client";

// PROTOTYPE for wayfinder ticket #18 ("Design the Konami-code -> Matrix-rain
// easter egg"). Throwaway: not meant to reach main as-is. Three variants of
// the easter egg, switchable via `?variant=A|B|C` (and, for real, via the
// actual Konami sequence: ↑↑↓↓←→←→BA), mounted globally on the homepage.
//
//   A — Classic curtain: full-bleed, non-interactive, fixed 6s, keyboard-only.
//   B — Terminal takeover: site-themed, dismiss on any key/click/tap, also
//       reachable on touch devices via a tap-5x trigger.
//   C — Minimal glitch flash: contained to a band, very short, honours
//       prefers-reduced-motion, deliberately has no mobile trigger.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type VariantKey = "A" | "B" | "C";

const VARIANTS: Record<VariantKey, string> = {
  A: "Classic curtain",
  B: "Terminal takeover",
  C: "Minimal glitch flash",
};

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

const GLYPHS = "アイウエオカキクケコサシスセソ0123456789$#@!<>/\\";

function currentTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function MatrixRainCanvas({
  palette,
  band,
}: {
  palette: string[];
  band: "top-third" | "full";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;
    const canvas: HTMLCanvasElement = el;
    const ctx: CanvasRenderingContext2D = context;

    const fontSize = 16;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height =
        band === "top-third"
          ? Math.max(160, Math.floor(window.innerHeight / 3))
          : window.innerHeight;
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
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
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

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [palette, band]);

  return <canvas ref={canvasRef} className="block w-full" />;
}

function KonamiEasterEggInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("variant");
  const activeVariant: VariantKey =
    requested === "A" || requested === "B" || requested === "C"
      ? requested
      : "A";

  const [active, setActive] = useState(false);
  const [dismissHint, setDismissHint] = useState(false);
  const progressRef = useRef(0);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  const trigger = useCallback(() => setActive(true), []);
  const dismiss = useCallback(() => setActive(false), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if (active) {
        if (activeVariant === "B") dismiss();
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
  }, [active, activeVariant, dismiss, trigger]);

  useEffect(() => {
    if (!active) return;
    setDismissHint(false);

    if (activeVariant === "A") {
      const hint = window.setTimeout(() => setDismissHint(true), 1000);
      const end = window.setTimeout(() => dismiss(), 6000);
      return () => {
        window.clearTimeout(hint);
        window.clearTimeout(end);
      };
    }
    if (activeVariant === "B") {
      const hint = window.setTimeout(() => setDismissHint(true), 1500);
      const safety = window.setTimeout(() => dismiss(), 8000);
      return () => {
        window.clearTimeout(hint);
        window.clearTimeout(safety);
      };
    }
    if (activeVariant === "C") {
      const end = window.setTimeout(() => dismiss(), 2500);
      return () => window.clearTimeout(end);
    }
  }, [active, activeVariant, dismiss]);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function handleLogoTap() {
    if (activeVariant !== "B") return;
    tapCountRef.current += 1;
    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
    tapTimerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      trigger();
    }
  }

  return (
    <>
      {/* Variant B's mobile-friendly trigger: tap 5x fast within 2s */}
      {activeVariant === "B" && (
        <button
          type="button"
          onClick={handleLogoTap}
          className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full border border-cyan/40 text-cyan text-[10px] flex items-center justify-center opacity-60"
          aria-label="Tap 5 times fast for a surprise"
        >
          ns.
        </button>
      )}

      {active && (
        <div
          className="fixed inset-0 z-[9999] bg-black overflow-hidden"
          onClick={() => activeVariant === "B" && dismiss()}
        >
          {activeVariant === "C" && reducedMotion ? (
            <div className="w-full h-full flex items-center justify-center text-cyan font-mono text-sm tracking-widest px-6 text-center">
              wake up, nuno... the matrix has you.
            </div>
          ) : (
            <MatrixRainCanvas
              palette={
                activeVariant === "A"
                  ? ["#00ff41", "#0dff6a", "#00b82f"]
                  : activeVariant === "B"
                    ? currentTheme() === "light"
                      ? ["#0e7490", "#be185d", "#0e7490"]
                      : ["#00ffff", "#ff00cc", "#00ffff"]
                    : ["#00ffff", "#ffffff"]
              }
              band={activeVariant === "C" ? "top-third" : "full"}
            />
          )}

          {activeVariant === "B" && (
            <p
              className="glitch absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-2xl md:text-4xl text-cyan tracking-widest uppercase px-4"
              data-text="wake up, nuno_"
            >
              wake up, nuno_
            </p>
          )}

          {activeVariant === "A" && dismissHint && (
            <p className="absolute bottom-10 inset-x-0 text-center text-[#00ff41] text-xs tracking-[0.3em] uppercase">
              the matrix has you...
            </p>
          )}

          {activeVariant === "B" && dismissHint && (
            <p className="absolute bottom-10 inset-x-0 text-center text-cyan text-xs tracking-[0.3em] uppercase px-4">
              press any key / tap to continue
            </p>
          )}
        </div>
      )}

      {/* Prototype-only variant switcher, hidden in production builds */}
      {process.env.NODE_ENV !== "production" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 rounded-full border border-border-strong bg-background/90 backdrop-blur px-4 py-2 text-xs shadow-lg">
          {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
            <button
              key={key}
              onClick={() => router.replace(`?variant=${key}`)}
              className={`px-2 py-1 rounded-full transition-colors ${
                activeVariant === key
                  ? "bg-cyan text-on-accent"
                  : "text-muted-3 hover:text-cyan"
              }`}
            >
              {key}
            </button>
          ))}
          <span className="text-muted-4 hidden sm:inline">
            {VARIANTS[activeVariant]}
          </span>
          <button
            onClick={trigger}
            className="px-3 py-1 rounded-full border border-cyan text-cyan hover:bg-cyan hover:text-on-accent whitespace-nowrap"
          >
            trigger ↑↑↓↓←→←→BA
          </button>
        </div>
      )}
    </>
  );
}

export default function KonamiMatrixRainPrototype() {
  return <KonamiEasterEggInner />;
}

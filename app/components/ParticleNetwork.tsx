"use client";

import { useEffect, useRef } from "react";
import { THEME_CHANGE_EVENT } from "./ThemeToggle";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorIndex: number;
}

const PARTICLE_COUNT = 70;
const MAX_DISTANCE = 140;

const PALETTES: Record<"dark" | "light", { dots: string[]; line: string }> = {
  dark: {
    dots: ["#00ffff", "#00ffff", "#00ffff", "#ff00cc", "#9b27af"],
    line: "0, 255, 255",
  },
  light: {
    dots: ["#0e7490", "#0e7490", "#0e7490", "#be185d", "#7e22ce"],
    line: "14, 116, 144",
  },
};

function currentTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const context = el.getContext("2d");
    if (!context) return;

    // Re-bind with explicit non-null types so TS retains the narrowing
    // inside the nested `draw` closure below.
    const canvas: HTMLCanvasElement = el;
    const ctx: CanvasRenderingContext2D = context;

    let palette = PALETTES[currentTheme()];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        colorIndex: Math.floor(Math.random() * palette.dots.length),
      })
    );

    let animId: number;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = palette.dots[p.colorIndex % palette.dots.length];
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DISTANCE) {
            const opacity = (1 - dist / MAX_DISTANCE) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${palette.line}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleThemeChange = () => {
      palette = PALETTES[currentTheme()];
    };

    window.addEventListener("resize", resize);
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

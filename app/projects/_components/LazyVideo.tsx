"use client";

import { useEffect, useRef, useState } from "react";

// Muted autoplay-loop clip that only mounts its <video> once it scrolls near
// view — the case-study media grid holds several clips and one is ~10 MB, so
// eager autoplay would pull all of them on load.
export default function LazyVideo({
  src,
  caption,
}: {
  src: string;
  caption: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div
      ref={ref}
      className="w-full bg-surface"
      style={{ aspectRatio: "16 / 9" }}
    >
      {show ? (
        <video
          src={src}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          aria-label={caption}
          className="w-full h-full object-cover block"
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-muted-5 text-xs tracking-[0.2em] uppercase">
          clip
        </div>
      )}
    </div>
  );
}

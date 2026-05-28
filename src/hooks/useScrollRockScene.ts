"use client";

import { useEffect, useRef, useState } from "react";
import {
  maxStackCountForWorks,
  rotationYFromScrollY,
  stackCountFromScroll,
} from "@/lib/rockStackLayout";

export const ROCK_INVALIDATE_EVENT = "rock-invalidate";

function emitRockInvalidate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ROCK_INVALIDATE_EVENT));
  }
}

export function useScrollRockScene(worksCount: number, enabled = true) {
  const [stackCount, setStackCount] = useState(1);
  const [maxStack, setMaxStack] = useState(() =>
    maxStackCountForWorks(worksCount)
  );
  const rotationYRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      rotationYRef.current = rotationYFromScrollY(window.scrollY);
      setMaxStack(maxStackCountForWorks(worksCount));
      const next = stackCountFromScroll(window.scrollY, worksCount);
      setStackCount((prev) => (prev === next ? prev : next));
      emitRockInvalidate();
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [worksCount, enabled]);

  return { stackCount, maxStack, rotationYRef };
}

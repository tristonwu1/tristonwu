"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 32;

type CursorState = "scroll" | "triangle" | "expand";

/**
 * Replaces the native cursor (on fine-pointer devices). At the top of the
 * homepage it shows the scroll cue; once scrolled it collapses to a small
 * triangle; over an interactive image it morphs into an expand button.
 */
export function CustomCursor() {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio") ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>("triangle");

  useEffect(() => {
    if (isStudio || typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [isStudio]);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("cursor-custom");

    const isHome = pathname === "/";
    let hovering = false;
    let scrolled = window.scrollY > SCROLL_THRESHOLD;

    const update = () =>
      setState(
        hovering ? "expand" : isHome && !scrolled ? "scroll" : "triangle"
      );

    const onMove = (event: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      if (!el.classList.contains("cursor--ready")) {
        el.classList.add("cursor--ready");
      }
    };

    const onScroll = () => {
      const next = window.scrollY > SCROLL_THRESHOLD;
      if (next !== scrolled) {
        scrolled = next;
        update();
      }
    };

    const isExpandTarget = (node: EventTarget | null) =>
      node instanceof Element && node.closest("[data-cursor='expand']");

    const onOver = (event: PointerEvent) => {
      if (!hovering && isExpandTarget(event.target)) {
        hovering = true;
        update();
      }
    };

    const onOut = (event: PointerEvent) => {
      if (
        hovering &&
        isExpandTarget(event.target) &&
        !isExpandTarget(event.relatedTarget)
      ) {
        hovering = false;
        update();
      }
    };

    const onLeave = () => rootRef.current?.classList.remove("cursor--ready");

    update();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerout", onOut, true);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      html.classList.remove("cursor-custom");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerout", onOut, true);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, pathname]);

  if (!enabled || isStudio) return null;

  return (
    <div ref={rootRef} className="cursor" data-state={state} aria-hidden>
      <div className="cursor-scroll">
        <span className="cursor-scroll-arrow" aria-hidden>
          ←
        </span>
        <span className="cursor-scroll-label">Scroll</span>
      </div>

      <div className="cursor-triangle">
        <svg viewBox="0 0 24 24">
          <polygon points="5,2 5,22 21,13" fill="currentColor" />
        </svg>
      </div>

      <div className="cursor-expand">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 9 V4 H9 M15 4 H20 V9 M20 15 V20 H15 M9 20 H4 V15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const DISMISS_OFFSET_PX = 32;

/**
 * Show the “scroll to continue” cue only while the user is at the very top of
 * the page. It hides once they scroll down and reappears when they return.
 */
export function useScrollContinueHint(enabled: boolean) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const sync = () => setVisible(window.scrollY <= DISMISS_OFFSET_PX);

    sync();
    window.addEventListener("scroll", sync, { passive: true });

    return () => window.removeEventListener("scroll", sync);
  }, [enabled]);

  return visible;
}

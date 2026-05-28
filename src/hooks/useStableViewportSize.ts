"use client";

import { useEffect, useState } from "react";
import { isMobileClient } from "@/lib/clientDevice";
import {
  readViewportSize,
  shouldIgnoreViewportHeightChange,
} from "@/lib/viewportStability";

const DEBOUNCE_MS = 280;

/**
 * Locks viewport height on mobile so address-bar show/hide does not
 * reflow slides, images, or the orthographic rock canvas.
 */
export function useStableViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0, stableHeight: 0 });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let lockedHeight = 0;

    const applyCssVar = (height: number) => {
      document.documentElement.style.setProperty(
        "--stable-viewport-height",
        `${height}px`
      );
    };

    const commit = () => {
      const { width, height } = readViewportSize();
      const mobile = isMobileClient();

      if (mobile) {
        if (lockedHeight === 0) {
          lockedHeight = height;
        } else if (!shouldIgnoreViewportHeightChange(lockedHeight, height)) {
          lockedHeight = height;
        }
      } else if (
        lockedHeight === 0 ||
        !shouldIgnoreViewportHeightChange(lockedHeight, height)
      ) {
        lockedHeight = height;
      }

      applyCssVar(lockedHeight);
      setSize({ width, height: lockedHeight, stableHeight: lockedHeight });
    };

    const schedule = () => {
      clearTimeout(timeout);
      timeout = setTimeout(commit, DEBOUNCE_MS);
    };

    commit();

    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);

    return () => {
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      clearTimeout(timeout);
      document.documentElement.style.removeProperty("--stable-viewport-height");
    };
  }, []);

  return size;
}

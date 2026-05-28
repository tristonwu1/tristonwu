import { isMobileClient } from "@/lib/clientDevice";

/** Ignore mobile browser chrome show/hide (address bar). */
export const MOBILE_VIEWPORT_HEIGHT_TOLERANCE = 140;

/** Desktop: only react to meaningful resizes. */
export const DESKTOP_VIEWPORT_HEIGHT_TOLERANCE = 48;

export function readViewportSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const vv = window.visualViewport;
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
  };
}

export function shouldIgnoreViewportHeightChange(
  prevHeight: number,
  nextHeight: number
): boolean {
  if (prevHeight <= 0) return false;
  const tolerance = isMobileClient()
    ? MOBILE_VIEWPORT_HEIGHT_TOLERANCE
    : DESKTOP_VIEWPORT_HEIGHT_TOLERANCE;
  return Math.abs(nextHeight - prevHeight) < tolerance;
}

export function stableViewportHeightKey(height: number): number {
  return Math.round(height / 50) * 50;
}

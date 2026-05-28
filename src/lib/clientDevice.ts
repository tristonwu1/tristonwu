/** True on phones / narrow viewports (matches reduced rock graphics). */
export function isMobileClient(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

/** Very small phones — tighter rock stack cap. */
export function isVerySmallViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 390px), (max-height: 680px)").matches;
}

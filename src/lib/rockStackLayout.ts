import * as THREE from "three";

const HERO_SELECTOR = ".works-rock-hero";

/** Fixed orthographic frustum height in world units (zoom scales to viewport). */
export const ORTHO_VISIBLE_HEIGHT = 5.4;
export const ORTHO_CAMERA_Z = 10;
/** Fraction of half-height from bottom edge where the base rock sits. */
const ORTHO_BOTTOM_INSET = 0.08;

/** One base rock on the hero + one added per furniture work. */
export function maxStackCountForWorks(worksCount: number): number {
  return Math.max(1, worksCount + 1);
}

function getStableViewportHeight(): number {
  if (typeof document === "undefined") return 800;
  const stable = document.documentElement.style.getPropertyValue(
    "--stable-viewport-height"
  );
  if (stable) {
    const parsed = Number.parseFloat(stable);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return window.visualViewport?.height ?? window.innerHeight;
}

function getHeroHeight(): number {
  if (typeof document === "undefined") return 800;
  const el = document.querySelector<HTMLElement>(HERO_SELECTOR);
  return el?.offsetHeight ?? getStableViewportHeight();
}

function getWorksScrollRange(heroHeight: number): number {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(1, maxScroll - heroHeight);
}

/** Radians of Y spin across a full page scroll. */
const SCROLL_ROTATION_Y = Math.PI * 1.5;

export function rotationYFromScrollY(scrollY: number): number {
  if (typeof document === "undefined") return 0;
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
  return progress * SCROLL_ROTATION_Y;
}

export function stackCountFromScroll(
  scrollY: number,
  worksCount: number
): number {
  const heroHeight = getHeroHeight();
  const maxStack = maxStackCountForWorks(worksCount);

  if (scrollY < heroHeight * 0.85) {
    return 1;
  }

  const scrollPastHero = scrollY - heroHeight;
  const progress = Math.min(1, scrollPastHero / getWorksScrollRange(heroHeight));
  const cap = maxStack - 1;
  const addedRocks = Math.round(progress * cap);

  return Math.min(maxStack, 1 + addedRocks);
}

/** World Y for the bottom of the base rock (bottom of ortho view). */
export function getGroundY(): number {
  const half = ORTHO_VISIBLE_HEIGHT / 2;
  return -half + half * ORTHO_BOTTOM_INSET;
}

export function getVisibleWorldHeight(): number {
  return ORTHO_VISIBLE_HEIGHT;
}

/** R3F orthographic zoom so visible height matches ORTHO_VISIBLE_HEIGHT. */
export function computeOrthoZoom(viewportHeightPx: number): number {
  return Math.max(40, viewportHeightPx / ORTHO_VISIBLE_HEIGHT);
}

/** Shift stack toward the bottom-right, beside the counter. */
export function computeRockStackOffsetX(
  viewportWidthPx: number,
  viewportHeightPx: number
): number {
  const zoom = computeOrthoZoom(viewportHeightPx);
  const visibleHalfWidth = viewportWidthPx / zoom / 2;
  return visibleHalfWidth * 0.52;
}

/** Scale rocks so the stack fits the fixed ortho frustum. */
export function computeRockScale(
  viewportHeightPx: number,
  stackCount: number,
  worksCount: number,
  stackCap = maxStackCountForWorks(worksCount)
): number {
  const maxStack = stackCap;
  const visibleHeight = getVisibleWorldHeight();
  const AVG_ROCK_HEIGHT = 0.95;
  const LAYER_OVERLAP = 0.76;

  const heightFactor = THREE.MathUtils.clamp(viewportHeightPx / 900, 0.88, 1.12);
  // Stacked: fill ratio > 1 so the full stack overflows the top of the frustum
  // (the upper rocks run off-screen) instead of fitting neatly inside it.
  const fillRatio =
    stackCount <= 1
      ? THREE.MathUtils.clamp(0.44 + worksCount * 0.012, 0.4, 0.5)
      : THREE.MathUtils.clamp(0.8 + worksCount * 0.032, 0.88, 1.22);
  const targetHeight = visibleHeight * fillRatio * heightFactor;

  const layersFor = (count: number) =>
    count <= 1 ? 1 : 1 + (count - 1) * LAYER_OVERLAP;

  const scale =
    targetHeight / (layersFor(stackCount) * AVG_ROCK_HEIGHT);

  const minScale = 0.28;
  const soloCap = 1.15;

  return THREE.MathUtils.clamp(
    scale,
    minScale,
    stackCount <= 1 ? soloCap : targetHeight / (layersFor(maxStack) * AVG_ROCK_HEIGHT)
  );
}

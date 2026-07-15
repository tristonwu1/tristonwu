import type { ImageLoaderProps } from "next/image";

/** Largest width we ever request. Past ~2.5k the file cost outweighs any
 *  visible gain, even on 4K/retina displays (standard portfolio cap). */
const MAX_WIDTH = 2560;

/**
 * Lets `next/image` build a real responsive `srcset` for both Sanity-hosted
 * and local images:
 *  - Sanity CDN URLs are resized on the fly (`?w=&q=&auto=format&fit=max`), so
 *    each device/DPR gets an appropriately sized, retina-crisp image without
 *    re-uploading anything.
 *  - Local (already-optimized) assets are returned untouched.
 */
export function responsiveImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (src.includes("cdn.sanity.io")) {
    const w = Math.min(width, MAX_WIDTH);
    const q = quality ?? 78;
    return `${src}?w=${w}&q=${q}&auto=format&fit=max`;
  }
  return src;
}

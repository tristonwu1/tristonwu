"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

type WorkImageMediaProps = {
  src: string;
  width: number;
  height: number;
  sizes: string;
  alt?: string;
  scrollerRoot?: Element | null;
};

/**
 * Reserves the exact aspect-ratio box from manifest dimensions (pure CSS, so
 * server and client agree — no hydration jump), then lazy-loads a blurred thumb
 * that sharpens in once decoded. The box never resizes, loaded or not.
 */
export function WorkImageMedia({
  src,
  width,
  height,
  sizes,
  alt = "",
  scrollerRoot = null,
}: WorkImageMediaProps) {
  const { ref, inView } = useInView<HTMLDivElement>({
    root: scrollerRoot,
    rootMargin: "300px 180px",
    threshold: 0,
  });
  const [sharpReady, setSharpReady] = useState(false);

  useEffect(() => {
    setSharpReady(false);
  }, [src]);

  return (
    <div
      ref={ref}
      className="work-image-slot"
      style={
        {
          "--aspect-w": width,
          "--aspect-h": height,
        } as React.CSSProperties
      }
    >
      {inView ? (
        <div className="work-image-stack">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            aria-hidden
            className="work-image work-image--blur"
            decoding="async"
          />
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={`work-image work-image--sharp${
              sharpReady ? " work-image--sharp-ready" : ""
            }`}
            unoptimized
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onLoad={() => setSharpReady(true)}
          />
        </div>
      ) : null}
    </div>
  );
}

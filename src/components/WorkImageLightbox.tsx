"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { WorkImage } from "@/data/works";
import { responsiveImageLoader } from "@/lib/imageLoader";

const CLOSE_ANIMATION_MS = 220;

type WorkImageLightboxProps = {
  images: WorkImage[];
  index: number;
  title: string;
  onClose: () => void;
};

export function WorkImageLightbox({
  images,
  index,
  title,
  onClose,
}: WorkImageLightboxProps) {
  const image = images[index];
  const [fullReady, setFullReady] = useState(false);
  const [closing, setClosing] = useState(false);

  const requestClose = useCallback(() => setClosing(true), []);

  useEffect(() => {
    setFullReady(false);
  }, [image?.src, index]);

  // Play the exit animation before unmounting.
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, CLOSE_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [requestClose]);

  if (!image) return null;

  return createPortal(
    <div
      className={`work-lightbox${closing ? " work-lightbox--closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image ${index + 1}`}
      onClick={requestClose}
    >
      <button
        type="button"
        className="work-lightbox-close"
        onClick={(event) => {
          event.stopPropagation();
          requestClose();
        }}
        aria-label="Close"
      >
        ×
      </button>
      <div
        className="work-lightbox-stage"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="work-lightbox-image-wrap"
          style={
            {
              "--aspect-w": image.width,
              "--aspect-h": image.height,
            } as React.CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.thumb}
            alt=""
            aria-hidden
            className="work-lightbox-image work-lightbox-image--blur"
            decoding="async"
          />
          <Image
            src={image.src}
            alt={title}
            width={image.width}
            height={image.height}
            sizes="100vw"
            quality={84}
            loader={responsiveImageLoader}
            className={`work-lightbox-image work-lightbox-image--full${
              fullReady ? " work-lightbox-image--full-ready" : ""
            }`}
            loading="eager"
            decoding="async"
            onLoad={() => setFullReady(true)}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

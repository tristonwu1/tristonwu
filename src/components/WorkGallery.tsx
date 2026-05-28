"use client";

import { useState } from "react";
import type { WorkImage } from "@/data/works";
import { WorkImageMedia } from "@/components/WorkImageMedia";
import { WorkImageLightbox } from "@/components/WorkImageLightbox";

type WorkGalleryProps = {
  images: WorkImage[];
  title: string;
};

export function WorkGallery({ images, title }: WorkGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [scrollerEl, setScrollerEl] = useState<HTMLDivElement | null>(null);

  if (images.length === 0) return null;

  const isLandscape = (img: WorkImage) => img.width > img.height;

  return (
    <>
      <div
        ref={setScrollerEl}
        className="work-gallery-scroller"
        aria-label={`Images for ${title}`}
      >
        <div className="work-gallery-track">
          {images.map((image, imageIndex) => (
            <button
              key={image.src}
              type="button"
              data-cursor="expand"
              className={`work-gallery-item${
                imageIndex === 0 ? " work-gallery-item--lead" : ""
              }`}
              onClick={() => setLightboxIndex(imageIndex)}
              aria-label={`View image ${imageIndex + 1} of ${images.length} for ${title}`}
            >
              <div
                className={`work-image-frame${
                  isLandscape(image) ? " work-image-frame--landscape" : ""
                }`}
              >
                <WorkImageMedia
                  src={image.thumb}
                  width={image.thumbWidth}
                  height={image.thumbHeight}
                  sizes="(max-width: 768px) 40vw, 22vw"
                  scrollerRoot={scrollerEl}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null ? (
        <WorkImageLightbox
          images={images}
          index={lightboxIndex}
          title={title}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}

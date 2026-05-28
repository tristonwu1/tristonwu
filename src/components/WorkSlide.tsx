"use client";

import { useEffect, useRef, useState } from "react";
import type { Work } from "@/data/works";
import { WorkGallery } from "@/components/WorkGallery";

type WorkSlideProps = {
  work: Work;
  index: number;
};

export function WorkSlide({ work, index }: WorkSlideProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0.4),
      { threshold: [0, 0.4, 0.65, 1], rootMargin: "-12% 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="work-slide"
      data-index={index}
      aria-label={work.title}
    >
      <div className={`work-slide-inner ${visible ? "work-slide-inner--active" : ""}`}>
        <WorkGallery images={work.images} title={work.title} />
        <div className="work-caption">
          <p className="work-caption-title">
            {work.title}
            <span className="work-caption-year">, {work.year}</span>
          </p>
          {work.medium ? (
            <p className="work-caption-line">{work.medium}</p>
          ) : null}
          {work.dimensions ? (
            <p className="work-caption-line">{work.dimensions}</p>
          ) : null}
          <p className="work-caption-tags">{work.tags}</p>
        </div>
      </div>
    </section>
  );
}

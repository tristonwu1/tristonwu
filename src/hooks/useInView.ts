"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  /** Keep reporting true after first intersection (default true). */
  once?: boolean;
};

export function useInView<T extends Element>({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, once]);

  return { ref, inView };
}

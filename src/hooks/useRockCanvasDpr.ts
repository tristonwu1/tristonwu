"use client";

import { useEffect, useState } from "react";
import { isMobileClient } from "@/lib/clientDevice";

const MAX_DPR_DESKTOP = 1.25;
const MAX_DPR_MOBILE = 1;

export function useRockCanvasDpr(): number {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const update = () => {
      const cap = isMobileClient() ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP;
      setDpr(Math.min(window.devicePixelRatio || 1, cap));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return dpr;
}

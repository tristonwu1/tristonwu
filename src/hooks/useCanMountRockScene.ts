"use client";

import { useEffect, useState } from "react";
import { isMobileClient } from "@/lib/clientDevice";

/** Wait until the shell is visible before mounting WebGL (avoids mobile crashes at loader exit). */
export function useCanMountRockScene(appVisible: boolean, hasPrebuilt: boolean) {
  const [canMount, setCanMount] = useState(false);

  useEffect(() => {
    if (!appVisible || !hasPrebuilt) {
      setCanMount(false);
      return;
    }

    const delay = isMobileClient() ? 320 : 80;
    const timer = window.setTimeout(() => setCanMount(true), delay);

    return () => {
      window.clearTimeout(timer);
      setCanMount(false);
    };
  }, [appVisible, hasPrebuilt]);

  return canMount;
}

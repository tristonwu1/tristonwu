"use client";

import { useEffect, useRef, useState } from "react";
import { works } from "@/data/works";
import { bootstrapHomeWithTimeout } from "@/lib/siteBootstrap";
import type { PrebuiltRockStack } from "@/lib/prebuildRockStack";
import { prebuildRockStack } from "@/lib/prebuildRockStack";
import {
  createStackSeed,
  type ProceduralStackPlan,
} from "@/lib/proceduralStack";
import { isMobileClient } from "@/lib/clientDevice";
import {
  readViewportSize,
  shouldIgnoreViewportHeightChange,
  stableViewportHeightKey,
} from "@/lib/viewportStability";

export type SiteLoadPhase = "loading" | "filling" | "exiting" | "ready";

type BootstrapState = {
  phase: SiteLoadPhase;
  barProgress: number;
  prebuilt: PrebuiltRockStack | null;
};

const FILL_MS = 520;
const EXIT_MS = 480;
const REVEAL_MS = 560;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function useSiteBootstrap(isHome: boolean) {
  const [stackSeed, setStackSeed] = useState(0);
  const worksCount = works.length;

  const [state, setState] = useState<BootstrapState>(() =>
    isHome
      ? { phase: "loading", barProgress: 0, prebuilt: null }
      : { phase: "ready", barProgress: 1, prebuilt: null }
  );

  const buildKeyRef = useRef("");
  const prebuiltRef = useRef<PrebuiltRockStack | null>(null);
  const fillRafRef = useRef(0);
  const prebuildGenRef = useRef(0);

  useEffect(() => {
    if (!isHome || stackSeed !== 0) return;
    setStackSeed(createStackSeed());
  }, [isHome, stackSeed]);

  useEffect(() => {
    if (!isHome || stackSeed === 0) {
      if (!isHome) {
        setState({ phase: "ready", barProgress: 1, prebuilt: null });
      }
      return;
    }

    const viewportHeight = readViewportSize().height;
    const key = `${stackSeed}-${worksCount}-${stableViewportHeightKey(viewportHeight)}`;

    if (buildKeyRef.current === key && prebuiltRef.current) {
      setState({ phase: "ready", barProgress: 1, prebuilt: prebuiltRef.current });
      return;
    }

    buildKeyRef.current = key;
    prebuiltRef.current = null;
    setState({ phase: "loading", barProgress: 0, prebuilt: null });

    let cancelled = false;
    const prebuildGen = ++prebuildGenRef.current;

    const runPrebuild = (plan: ProceduralStackPlan) => {
      prebuildRockStack(
        stackSeed,
        worksCount,
        viewportHeight,
        plan,
        (layerIndex, layerCount) => {
          if (cancelled || prebuildGenRef.current !== prebuildGen) return;
          const t = layerCount > 0 ? (layerIndex + 1) / layerCount : 1;
          setState((prev) => ({
            ...prev,
            barProgress: Math.max(prev.barProgress, 0.72 + t * 0.2),
          }));
        }
      )
        .then((prebuilt) => {
          if (cancelled || prebuildGenRef.current !== prebuildGen) return;
          prebuiltRef.current = prebuilt;
          setState((prev) => ({ ...prev, prebuilt }));
        })
        .catch((err) => {
          console.error(err);
        });
    };

    bootstrapHomeWithTimeout(stackSeed, worksCount, (progress) => {
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          barProgress: Math.max(prev.barProgress, progress),
        }));
      }
    })
      .then(({ plan }) => {
        if (cancelled) return;
        setState((prev) => ({
          phase: "filling",
          barProgress: Math.max(prev.barProgress, 0.72),
          prebuilt: prev.prebuilt,
        }));
        runPrebuild(plan);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setState({ phase: "ready", barProgress: 1, prebuilt: null });
        }
      });

    return () => {
      cancelled = true;
      prebuildGenRef.current += 1;
    };
  }, [isHome, stackSeed, worksCount]);

  useEffect(() => {
    if (state.phase !== "filling") return;

    const start = state.barProgress;
    const t0 = performance.now();
    cancelAnimationFrame(fillRafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / FILL_MS);
      const progress = start + (1 - start) * easeOutCubic(t);
      setState((prev) => ({ ...prev, barProgress: progress }));

      if (t < 1) {
        fillRafRef.current = requestAnimationFrame(tick);
      } else {
        setState((prev) => ({ ...prev, phase: "exiting", barProgress: 1 }));
      }
    };

    fillRafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(fillRafRef.current);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "exiting") return;

    const exitTimer = window.setTimeout(() => {
      setState((prev) => ({ ...prev, phase: "ready" }));
    }, EXIT_MS);

    return () => clearTimeout(exitTimer);
  }, [state.phase]);

  useEffect(() => {
    if (!isHome || isMobileClient()) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let lastHeight = readViewportSize().height;

    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const viewportHeight = readViewportSize().height;
        if (shouldIgnoreViewportHeightChange(lastHeight, viewportHeight)) {
          return;
        }
        lastHeight = viewportHeight;

        const key = `${stackSeed}-${worksCount}-${stableViewportHeightKey(viewportHeight)}`;
        if (buildKeyRef.current === key || !prebuiltRef.current) return;

        buildKeyRef.current = key;

        try {
          const prebuilt = await prebuildRockStack(
            stackSeed,
            worksCount,
            viewportHeight,
            prebuiltRef.current.plan
          );
          prebuiltRef.current = prebuilt;
          setState((prev) => ({ ...prev, prebuilt }));
        } catch (err) {
          console.error(err);
        }
      }, 400);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timeout);
    };
  }, [isHome, stackSeed, worksCount]);

  const showLoader =
    state.phase === "loading" ||
    state.phase === "filling" ||
    state.phase === "exiting";
  const showApp = state.phase === "exiting" || state.phase === "ready";
  const appVisible = state.phase === "ready";

  return {
    ...state,
    stackSeed,
    showLoader,
    showApp,
    appVisible,
    revealMs: REVEAL_MS,
  };
}

"use client";

import { usePathname } from "next/navigation";
import { useRockSceneMetrics } from "@/contexts/RockSceneContext";
import { useScrollContinueHint } from "@/hooks/useScrollContinueHint";

export function SiteCornerHints() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { stackCount, maxStack } = useRockSceneMetrics();
  const showScrollHint = useScrollContinueHint(isHome);

  if (!isHome) return null;

  return (
    <div className="site-corner-hints">
      <p
        className={`site-corner-hint site-corner-hint--left site-corner-hint--scroll ${
          showScrollHint ? "" : "site-corner-hint--hidden"
        }`}
        aria-hidden={!showScrollHint}
        aria-label="Scroll down"
      >
        <span className="scroll-cue">
          <span className="scroll-cue-arrow" aria-hidden>
            ←
          </span>
          <span className="scroll-cue-label">Scroll</span>
        </span>
      </p>
      <p
        className="site-corner-hint site-corner-hint--right site-corner-hint--counter"
        aria-hidden
      >
        {String(stackCount).padStart(2, "0")} / {String(maxStack).padStart(2, "0")}
      </p>
    </div>
  );
}

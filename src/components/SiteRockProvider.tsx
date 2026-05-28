"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RockSceneErrorBoundary } from "@/components/RockSceneErrorBoundary";
import { SiteLoadingScreen } from "@/components/SiteLoadingScreen";
import { SiteCornerHints } from "@/components/SiteCornerHints";
import { CustomCursor } from "@/components/CustomCursor";
import { RockSceneProvider } from "@/contexts/RockSceneContext";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import type { Work } from "@/data/works";
import { useCanMountRockScene } from "@/hooks/useCanMountRockScene";
import { useScrollRockScene } from "@/hooks/useScrollRockScene";
import { useSiteBootstrap } from "@/hooks/useSiteBootstrap";
import { useStableViewportSize } from "@/hooks/useStableViewportSize";

const RotatingRock = dynamic(
  () => import("@/components/RotatingRock").then((m) => m.RotatingRock),
  { ssr: false }
);

export function SiteRockProvider({
  works,
  children,
}: {
  works: Work[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isStudio = pathname?.startsWith("/studio") ?? false;
  const worksCount = works.length;
  const {
    phase,
    barProgress,
    prebuilt,
    showLoader,
    showApp,
    appVisible,
  } = useSiteBootstrap(isHome, worksCount);
  const { stackCount, maxStack, rotationYRef } = useScrollRockScene(
    worksCount,
    isHome && appVisible
  );
  const { stableHeight: viewportHeight } = useStableViewportSize();
  const canMountRock = useCanMountRockScene(
    appVisible,
    Boolean(isHome && prebuilt)
  );

  // The embedded Sanity Studio is a full-screen app; render it without the
  // site shell, loading screen, or rock scene.
  if (isStudio) return <>{children}</>;

  return (
    <>
      {showLoader ? (
        <SiteLoadingScreen
          progress={barProgress}
          exiting={phase === "exiting"}
        />
      ) : null}

      {showApp ? (
        <div
          className={`site-shell ${appVisible ? "site-shell--visible" : ""}`}
        >
          <RockSceneProvider
            value={{ stackCount, maxStack, prebuilt: isHome ? prebuilt : null }}
          >
            <SiteCornerHints />
            {canMountRock && prebuilt && viewportHeight > 0 ? (
              <RockSceneErrorBoundary>
                <RotatingRock
                  stackCount={stackCount}
                  viewportHeight={viewportHeight}
                  rotationYRef={rotationYRef}
                  prebuilt={prebuilt}
                />
              </RockSceneErrorBoundary>
            ) : null}
            <SiteContentProvider works={works}>{children}</SiteContentProvider>
          </RockSceneProvider>
          <CustomCursor />
        </div>
      ) : null}
    </>
  );
}

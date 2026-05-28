"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { OrthoCameraSync } from "@/components/OrthoCameraSync";
import { RockLighting } from "@/components/RockLighting";
import { RockStack } from "@/components/RockStack";
import { useRockSceneMetrics } from "@/contexts/RockSceneContext";
import { usePageVisible } from "@/hooks/usePageVisible";
import { useReducedRockGraphics } from "@/hooks/useReducedRockGraphics";
import { useRockCanvasDpr } from "@/hooks/useRockCanvasDpr";
import { computeOrthoZoom } from "@/lib/rockStackLayout";
import type { PrebuiltRockStack } from "@/lib/prebuildRockStack";

type RotatingRockProps = {
  stackCount: number;
  viewportHeight: number;
  rotationYRef: React.RefObject<number>;
  prebuilt: PrebuiltRockStack;
};

function RockScene({
  stackCount,
  viewportHeight,
  rotationYRef,
  prebuilt,
}: RotatingRockProps) {
  return (
    <>
      <OrthoCameraSync viewportHeight={viewportHeight} />
      <RockLighting />
      <RockStack
        stackCount={stackCount}
        prebuilt={prebuilt}
        rotationYRef={rotationYRef}
        layoutViewportHeight={viewportHeight}
      />
    </>
  );
}

export function RotatingRock({
  stackCount,
  viewportHeight,
  rotationYRef,
  prebuilt,
}: RotatingRockProps) {
  const dpr = useRockCanvasDpr();
  const reduced = useReducedRockGraphics();
  const pageVisible = usePageVisible();
  const initialZoom = computeOrthoZoom(viewportHeight);

  return (
    <div className="rock-scene" aria-hidden inert>
      <Canvas
        orthographic
        frameloop={pageVisible ? "demand" : "never"}
        shadows={!reduced}
        performance={{ min: 0.5, max: 1, debounce: 200 }}
        dpr={dpr}
        eventSource={undefined}
        camera={{
          zoom: initialZoom,
          position: [0, 0, 10],
          near: 0.1,
          far: 200,
        }}
        gl={{
          alpha: true,
          antialias: !reduced,
          powerPreference: reduced ? "low-power" : "default",
          failIfMajorPerformanceCaveat: false,
          toneMapping: reduced ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <RockScene
            stackCount={stackCount}
            viewportHeight={viewportHeight}
            rotationYRef={rotationYRef}
            prebuilt={prebuilt}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

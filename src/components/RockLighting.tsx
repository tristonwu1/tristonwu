"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { getGroundY } from "@/lib/rockStackLayout";
import { useReducedRockGraphics } from "@/hooks/useReducedRockGraphics";

/** Gallery-style lighting matched to the site’s warm cream palette. */
export function RockLighting() {
  const reduced = useReducedRockGraphics();
  const shadowY = getGroundY();

  return (
    <>
      <hemisphereLight
        color="#faf6ef"
        groundColor="#5c564e"
        intensity={0.55}
      />

      <directionalLight
        castShadow={!reduced}
        position={[5, 9, 6]}
        intensity={1.35}
        color="#fff8f0"
        shadow-mapSize={reduced ? [1024, 1024] : [2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={24}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0002}
      />

      {!reduced ? (
        <>
          <directionalLight
            position={[-6, 4, -4]}
            intensity={0.55}
            color="#d8d0c4"
          />
          <directionalLight
            position={[0, -3, 4]}
            intensity={0.28}
            color="#ebe5da"
          />
          <pointLight position={[0, 1, -5]} intensity={0.35} color="#f4f1eb" />
        </>
      ) : null}

      {!reduced && (
        <Environment resolution={256} environmentIntensity={0.45}>
          <Lightformer
            intensity={1.2}
            color="#faf6ef"
            position={[6, 6, 4]}
            scale={[12, 8, 1]}
            rotation={[0, 0, -0.2]}
          />
          <Lightformer
            intensity={0.5}
            color="#c9bfb0"
            position={[-5, 2, -3]}
            scale={[8, 6, 1]}
          />
          <Lightformer
            intensity={0.35}
            color="#ffffff"
            position={[0, 8, 0]}
            scale={[16, 4, 1]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </Environment>
      )}

      {!reduced && (
        <ContactShadows
          position={[0, shadowY, 0]}
          opacity={0.38}
          scale={16}
          blur={3}
          far={4.5}
          color="#1a1917"
          resolution={512}
        />
      )}
    </>
  );
}

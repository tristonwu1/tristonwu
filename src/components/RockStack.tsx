"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { getTransformsForCount } from "@/lib/prebuildRockStack";
import type { PrebuiltRockStack } from "@/lib/prebuildRockStack";
import { useReducedRockGraphics } from "@/hooks/useReducedRockGraphics";
import { ROCK_INVALIDATE_EVENT } from "@/hooks/useScrollRockScene";
import { computeRockStackOffsetX } from "@/lib/rockStackLayout";

type RockStackProps = {
  stackCount: number;
  prebuilt: PrebuiltRockStack;
  rotationYRef: React.RefObject<number>;
  layoutViewportHeight: number;
};

const ROTATION_EPSILON = 0.0008;
const IDLE_SPIN_SPEED = 0.12;
const MOBILE_IDLE_SPIN_SPEED = 0.06;

export function RockStack({
  stackCount,
  prebuilt,
  rotationYRef,
  layoutViewportHeight,
}: RockStackProps) {
  const reduced = useReducedRockGraphics();
  const stackRef = useRef<Group>(null);
  const layerRefs = useRef<(Group | null)[]>([]);
  const currentRotationY = useRef(0);
  const idleRotationY = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  const viewport = useThree((s) => s.size);

  const cappedCount = Math.min(stackCount, prebuilt.maxStack);
  const transforms = getTransformsForCount(prebuilt, cappedCount);
  const stackOffsetX = computeRockStackOffsetX(
    viewport.width,
    layoutViewportHeight
  );
  const idleSpeed = reduced ? MOBILE_IDLE_SPIN_SPEED : IDLE_SPIN_SPEED;

  useEffect(() => {
    const onInvalidate = () => invalidate();
    window.addEventListener(ROCK_INVALIDATE_EVENT, onInvalidate);
    return () => window.removeEventListener(ROCK_INVALIDATE_EVENT, onInvalidate);
  }, [invalidate]);

  useEffect(() => {
    prebuilt.layers.forEach((layer, index) => {
      const group = layerRefs.current[index];
      const transform = transforms[index];
      if (!group) return;

      const visible = index < cappedCount;
      group.visible = visible;

      if (visible && transform) {
        group.position.copy(transform.position);
        group.quaternion.copy(transform.quaternion);
        group.scale.setScalar(transform.scale);
      }
    });
    invalidate();
  }, [cappedCount, prebuilt, transforms, invalidate]);

  useFrame((state, delta) => {
    idleRotationY.current += delta * idleSpeed;

    const scrollTarget = rotationYRef.current ?? 0;
    const target = scrollTarget + idleRotationY.current;

    if (!stackRef.current) return;

    const prev = currentRotationY.current;
    currentRotationY.current = THREE.MathUtils.lerp(
      currentRotationY.current,
      target,
      Math.min(1, delta * (reduced ? 10 : 5))
    );
    stackRef.current.rotation.y = currentRotationY.current;

    const animatingRotation =
      Math.abs(currentRotationY.current - target) > ROTATION_EPSILON ||
      Math.abs(prev - currentRotationY.current) > ROTATION_EPSILON;

    if (reduced || animatingRotation) {
      state.invalidate();
    }
  });

  return (
    <group ref={stackRef} position={[stackOffsetX, 0, 0]}>
      {prebuilt.layers.map((layer, index) => {
        if (index >= cappedCount) return null;

        return (
          <group
            key={`${prebuilt.plan.stackSeed}-${layer.rockId}-${index}`}
            ref={(node) => {
              layerRefs.current[index] = node;
            }}
          >
            <primitive object={layer.object} />
          </group>
        );
      })}
    </group>
  );
}

import * as THREE from "three";
import { buildRockStackTransforms, type RockTransform } from "@/lib/rockPlacement";
import { cloneRock, preloadRocks } from "@/lib/rockLoader";
import {
  generateProceduralStackPlan,
  type ProceduralStackPlan,
} from "@/lib/proceduralStack";
import { yieldToMain } from "@/lib/asyncUtils";
import { isMobileClient } from "@/lib/clientDevice";
import { computeRockScale, maxStackCountForWorks } from "@/lib/rockStackLayout";
import type { RockId } from "@/data/rocks";

export type PlacedRockLayer = {
  rockId: RockId;
  object: THREE.Object3D;
};

export type PrebuiltRockStack = {
  plan: ProceduralStackPlan;
  maxStack: number;
  layers: PlacedRockLayer[];
  /** transformsByCount[n] holds transforms for stack size n+1 */
  transformsByCount: RockTransform[][];
};

export async function prebuildRockStack(
  stackSeed: number,
  worksCount: number,
  viewportHeight: number,
  existingPlan?: ProceduralStackPlan,
  onLayerProgress?: (layerIndex: number, layerCount: number) => void
): Promise<PrebuiltRockStack> {
  const maxStack = existingPlan
    ? existingPlan.rockIds.length
    : maxStackCountForWorks(worksCount);
  const plan =
    existingPlan ?? generateProceduralStackPlan(maxStack, stackSeed);

  await preloadRocks(plan.rockIds);

  const layers: PlacedRockLayer[] = [];
  for (const rockId of plan.rockIds) {
    layers.push({ rockId, object: cloneRock(rockId) });
    if (isMobileClient()) {
      await yieldToMain();
    }
  }

  const objects = layers.map((l) => l.object);
  const transformsByCount: RockTransform[][] = [];

  for (let count = 1; count <= maxStack; count++) {
    const scale = computeRockScale(viewportHeight, count, worksCount, maxStack);
    const transforms = buildRockStackTransforms(
      objects.slice(0, count),
      scale,
      plan.layerSeeds.slice(0, count)
    );
    transformsByCount.push(transforms);
    onLayerProgress?.(count - 1, maxStack);
    if (isMobileClient()) {
      await yieldToMain();
    }
  }

  return {
    plan,
    maxStack,
    layers,
    transformsByCount,
  };
}

export function getTransformsForCount(
  prebuilt: PrebuiltRockStack,
  stackCount: number
): RockTransform[] {
  const index = Math.min(prebuilt.maxStack, Math.max(1, stackCount)) - 1;
  return prebuilt.transformsByCount[index] ?? [];
}

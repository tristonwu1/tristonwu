import { withTimeout, yieldToMain } from "@/lib/asyncUtils";
import { isMobileClient } from "@/lib/clientDevice";
import { preloadRocksBatched } from "@/lib/rockLoader";
import {
  generateProceduralStackPlan,
  type ProceduralStackPlan,
} from "@/lib/proceduralStack";
import { maxStackCountForWorks } from "@/lib/rockStackLayout";

const BOOTSTRAP_TIMEOUT_MS = 40_000;

export type BootstrapPlan = {
  plan: ProceduralStackPlan;
  maxStack: number;
};

function prefetchRockCanvas(): Promise<unknown> {
  return import("@/components/RotatingRock");
}

/**
 * Loads rock GLBs only — stack prebuild runs after the loader so the UI
 * can transition without a main-thread + WebGL spike at 100%.
 */
export async function bootstrapHome(
  stackSeed: number,
  worksCount: number,
  onProgress?: (progress: number) => void
): Promise<BootstrapPlan> {
  const report = (value: number) => onProgress?.(Math.min(0.72, Math.max(0, value)));
  const mobile = isMobileClient();
  const batchSize = mobile ? 2 : 6;

  report(0.05);

  const maxStack = maxStackCountForWorks(worksCount);
  const plan = generateProceduralStackPlan(maxStack, stackSeed);

  report(0.1);

  await Promise.all([
    preloadRocksBatched(plan.rockIds, batchSize, (loaded, total) => {
      const rockProgress = total > 0 ? loaded / total : 1;
      report(0.1 + rockProgress * 0.58);
    }),
    prefetchRockCanvas(),
  ]);

  report(0.72);
  await yieldToMain();

  return { plan, maxStack };
}

export function bootstrapHomeWithTimeout(
  stackSeed: number,
  worksCount: number,
  onProgress?: (progress: number) => void
): Promise<BootstrapPlan> {
  return withTimeout(
    bootstrapHome(stackSeed, worksCount, onProgress),
    BOOTSTRAP_TIMEOUT_MS,
    "bootstrapHome"
  );
}

import { ROCK_IDS, type RockId } from "@/data/rocks";
import { createSeededRandom } from "@/lib/rockPlacement";

export type ProceduralStackPlan = {
  stackSeed: number;
  rockIds: RockId[];
  layerSeeds: number[];
};

export function createStackSeed(): number {
  return Math.floor(Math.random() * 2147483646) + 1;
}

export function layerSeed(stackSeed: number, layerIndex: number, salt: number): number {
  return (
    (stackSeed * 2654435761 +
      layerIndex * 2246822519 +
      salt * 3266489917) >>>
    0
  );
}

function shuffleRockIds(stackSeed: number): RockId[] {
  const rng = createSeededRandom(stackSeed);
  const shuffled = [...ROCK_IDS];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/** Random bottom rock + varied sequence; unique seed per layer for vertex picks. */
export function generateProceduralStackPlan(
  stackCount: number,
  stackSeed: number
): ProceduralStackPlan {
  const pool = shuffleRockIds(stackSeed);
  const rng = createSeededRandom(stackSeed + 40499);
  const rockIds: RockId[] = [];

  for (let i = 0; i < stackCount; i++) {
    if (i < pool.length) {
      rockIds.push(pool[i]);
    } else {
      rockIds.push(pool[Math.floor(rng() * pool.length)]);
    }
  }

  const layerSeeds = Array.from({ length: stackCount }, (_, i) =>
    layerSeed(stackSeed, i, 17)
  );

  return { stackSeed, rockIds, layerSeeds };
}

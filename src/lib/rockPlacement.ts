import * as THREE from "three";
import {
  getSingleTopContactPoint,
  solvePointContactStack,
} from "@/lib/rockContact";

import { getGroundY } from "@/lib/rockStackLayout";

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export type RockTransform = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  topAnchor: THREE.Vector3;
};

export function createSeededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/** First rock: sits on ground; exposes a single top balance point. */
export function computeBaseRockTransform(
  object: THREE.Object3D,
  scale: number,
  layerSeed: number
): RockTransform {
  const group = new THREE.Group();
  group.add(object);

  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const rng = createSeededRandom(layerSeed + 3000);

  group.scale.setScalar(scale);
  group.position.set(
    -center.x * scale,
    getGroundY() - box.min.y * scale,
    -center.z * scale
  );
  group.quaternion.setFromAxisAngle(WORLD_UP, rng() * Math.PI * 2);

  const transform: RockTransform = {
    position: group.position.clone(),
    quaternion: group.quaternion.clone(),
    scale,
    topAnchor: new THREE.Vector3(),
  };

  object.removeFromParent();
  transform.topAnchor = getSingleTopContactPoint(object, transform, layerSeed);
  return transform;
}

/** Balance upper rock on one point of the lower rock. */
export function computeStackedRockTransform(
  object: THREE.Object3D,
  lowerObject: THREE.Object3D,
  lowerTransform: RockTransform,
  scale: number,
  layerSeed: number
): RockTransform {
  object.removeFromParent();
  return solvePointContactStack(
    object,
    lowerObject,
    lowerTransform,
    scale,
    layerSeed
  );
}

export function buildRockStackTransforms(
  objects: THREE.Object3D[],
  scale: number,
  layerSeeds: number[]
): RockTransform[] {
  const transforms: RockTransform[] = [];

  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const seed = layerSeeds[i] ?? i * 9973;

    if (i === 0) {
      transforms.push(computeBaseRockTransform(object, scale, seed));
    } else {
      transforms.push(
        computeStackedRockTransform(
          object,
          objects[i - 1],
          transforms[i - 1],
          scale,
          seed
        )
      );
    }
  }

  return transforms;
}

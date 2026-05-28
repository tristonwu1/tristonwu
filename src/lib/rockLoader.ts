import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { ROCK_IDS, rockModelPath, type RockId } from "@/data/rocks";
import { isMobileClient } from "@/lib/clientDevice";

const loader = new GLTFLoader();
const templateCache = new Map<RockId, THREE.Object3D>();
const loadPromises = new Map<RockId, Promise<THREE.Object3D>>();
const ROCK_LOAD_TIMEOUT_MS = 18_000;

async function loadTemplate(rockId: RockId): Promise<THREE.Object3D> {
  const cached = templateCache.get(rockId);
  if (cached) return cached;

  let pending = loadPromises.get(rockId);
  if (!pending) {
    pending = new Promise<THREE.Object3D>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        loadPromises.delete(rockId);
        reject(new Error(`Rock load timeout: ${rockId}`));
      }, ROCK_LOAD_TIMEOUT_MS);

      loader.load(
        rockModelPath(rockId),
        (gltf) => {
          window.clearTimeout(timer);
          templateCache.set(rockId, gltf.scene);
          loadPromises.delete(rockId);
          resolve(gltf.scene);
        },
        undefined,
        (error) => {
          window.clearTimeout(timer);
          loadPromises.delete(rockId);
          reject(error);
        }
      );
    });
    loadPromises.set(rockId, pending);
  }

  return pending;
}

export async function preloadRocks(rockIds: RockId[]): Promise<void> {
  const unique = [...new Set(rockIds)];
  await Promise.all(unique.map((id) => loadTemplate(id)));
}

/** Loads rocks in small batches so mobile dev Wi‑Fi can keep up. */
export async function preloadRocksBatched(
  rockIds: RockId[],
  batchSize: number,
  onBatch?: (loaded: number, total: number) => void
): Promise<void> {
  const unique = [...new Set(rockIds)];
  const total = unique.length;

  for (let i = 0; i < total; i += batchSize) {
    const batch = unique.slice(i, i + batchSize);
    await Promise.all(batch.map((id) => loadTemplate(id)));
    onBatch?.(Math.min(i + batch.length, total), total);
  }
}

const IDLE_BATCH = 6;

/** Load remaining pack rocks when the browser is idle. */
export function preloadRemainingRocksInIdle(skipIds: RockId[] = []): void {
  if (typeof window === "undefined") return;

  const skip = new Set(skipIds);
  const pending = ROCK_IDS.filter((id) => !skip.has(id) && !templateCache.has(id));
  if (!pending.length) return;

  let index = 0;

  const loadBatch = () => {
    const batch = pending.slice(index, index + IDLE_BATCH);
    index += IDLE_BATCH;
    if (!batch.length) return;

    Promise.all(batch.map((id) => loadTemplate(id))).finally(() => {
      if (index < pending.length) schedule();
    });
  };

  const schedule = () => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => loadBatch(), { timeout: 5000 });
    } else {
      setTimeout(loadBatch, 120);
    }
  };

  schedule();
}

function cloneHierarchy(
  node: THREE.Object3D,
  options: { simplified: boolean }
): THREE.Object3D {
  let clone: THREE.Object3D;

  if (node instanceof THREE.Mesh) {
    clone = new THREE.Mesh(node.geometry, node.material);
    if (!options.simplified) {
      clone.castShadow = true;
      clone.receiveShadow = true;
    }
  } else {
    clone = new THREE.Group();
  }

  clone.position.copy(node.position);
  clone.quaternion.copy(node.quaternion);
  clone.scale.copy(node.scale);

  for (const child of node.children) {
    clone.add(cloneHierarchy(child, options));
  }

  return clone;
}

export function cloneRock(rockId: RockId): THREE.Object3D {
  const template = templateCache.get(rockId);
  if (!template) {
    throw new Error(`Rock not preloaded: ${rockId}`);
  }
  return cloneHierarchy(template, { simplified: isMobileClient() });
}

export async function loadRockClone(rockId: RockId): Promise<THREE.Object3D> {
  await loadTemplate(rockId);
  return cloneRock(rockId);
}

export function setupRockMeshes(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

export function isRockPreloaded(rockId: RockId): boolean {
  return templateCache.has(rockId);
}

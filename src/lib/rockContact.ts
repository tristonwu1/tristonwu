import * as THREE from "three";
import { isMobileClient } from "@/lib/clientDevice";
import { createSeededRandom, type RockTransform } from "@/lib/rockPlacement";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const TOP_REGION = 0.34;
const BOTTOM_REGION = 0.34;
/** Horizontal tolerance for pairing an upper vertex with a lower one. */
const PAIR_RADIUS_RATIO = 0.22;

function tuning() {
  const mobile = isMobileClient();
  return {
    orientAttempts: mobile ? 8 : 14,
    settleSamples: mobile ? 140 : 240,
    localSampleCap: mobile ? 320 : 520,
    lowerSampleCap: mobile ? 700 : 1200,
  };
}

const _m = new THREE.Matrix4();
const _scaleVec = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Geometry sampling (pure helpers)
// ---------------------------------------------------------------------------

/**
 * Vertices in the object's own frame — i.e. the frame a RockTransform composes
 * with at render time. The rock is rendered as `<group transform><primitive
 * object/></group>`, so the points the transform acts on are the object's mesh
 * vertices baked through their full node hierarchy (`child.matrixWorld`, with
 * the object detached from any parent). This must match `setFromObject` used
 * for the base rock; stripping the object's own root matrix here is what left
 * stones floating.
 */
function collectLocalVertices(
  object: THREE.Object3D,
  cap = Infinity
): THREE.Vector3[] {
  object.removeFromParent();
  object.updateMatrixWorld(true);
  const v = new THREE.Vector3();
  const vertices: THREE.Vector3[] = [];

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const position = child.geometry.attributes.position;
      const step = Math.max(1, Math.floor(position.count / Math.max(1, cap)));
      for (let i = 0; i < position.count; i += step) {
        v.set(position.getX(i), position.getY(i), position.getZ(i));
        v.applyMatrix4(child.matrixWorld);
        vertices.push(v.clone());
      }
    }
  });
  return vertices;
}

function boxFromPoints(points: THREE.Vector3[]): THREE.Box3 {
  const box = new THREE.Box3();
  for (const p of points) box.expandByPoint(p);
  return box;
}

function regionPool(
  vertices: THREE.Vector3[],
  box: THREE.Box3,
  region: "top" | "bottom"
): THREE.Vector3[] {
  const span = box.max.y - box.min.y || 1;
  const threshold =
    region === "top"
      ? box.max.y - span * TOP_REGION
      : box.min.y + span * BOTTOM_REGION;

  const pool = vertices.filter((v) =>
    region === "top" ? v.y >= threshold : v.y <= threshold
  );
  return pool.length ? pool : [region === "top" ? box.max : box.min];
}

function localToWorld(local: THREE.Vector3, transform: RockTransform) {
  return local
    .clone()
    .multiplyScalar(transform.scale)
    .applyQuaternion(transform.quaternion)
    .add(transform.position);
}

// ---------------------------------------------------------------------------
// Lower-rock contact context: a 2D spatial hash over the lower rock's top
// vertices so each upper vertex can find the lower vertices in its column in
// roughly O(1), instead of scanning every vertex or raycasting triangles.
// ---------------------------------------------------------------------------

type LowerContext = {
  topVerts: THREE.Vector3[];
  grid: Map<string, number[]>;
  cellSize: number;
  topCenter: THREE.Vector3;
  topY: number;
};

function cellKey(x: number, z: number, cell: number): string {
  return `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
}

function buildLowerContext(
  lowerObject: THREE.Object3D,
  lowerTransform: RockTransform,
  sampleCap: number
): LowerContext {
  const locals = collectLocalVertices(lowerObject, sampleCap);
  _scaleVec.setScalar(lowerTransform.scale);
  _m.compose(lowerTransform.position, lowerTransform.quaternion, _scaleVec);

  const world = locals.map((v) => v.applyMatrix4(_m));
  const worldBox = boxFromPoints(world);
  const span = worldBox.max.y - worldBox.min.y || 1;
  const topThreshold = worldBox.max.y - span * TOP_REGION;

  const topVerts: THREE.Vector3[] = [];
  const center = new THREE.Vector3();
  for (const w of world) {
    if (w.y >= topThreshold) {
      topVerts.push(w);
      center.add(w);
    }
  }
  if (topVerts.length > 0) center.multiplyScalar(1 / topVerts.length);
  else worldBox.getCenter(center);

  const cellSize = Math.max(1e-4, PAIR_RADIUS_RATIO * lowerTransform.scale);
  const grid = new Map<string, number[]>();
  topVerts.forEach((v, i) => {
    const key = cellKey(v.x, v.z, cellSize);
    const bucket = grid.get(key);
    if (bucket) bucket.push(i);
    else grid.set(key, [i]);
  });

  return { topVerts, grid, cellSize, topCenter: center, topY: worldBox.max.y };
}

// ---------------------------------------------------------------------------
// Candidate construction + vertical settle
// ---------------------------------------------------------------------------

type SettleResult = {
  /** World-space point where the rocks first touch. */
  contact: THREE.Vector3;
  /** Horizontal distance from upper centre of mass to that contact point. */
  balanceOffset: number;
};

/**
 * Drops the (already oriented + roughly placed) upper rock straight down until
 * one of its bottom vertices first meets one of the lower rock's top vertices.
 * Purely vertex-to-vertex: for each upper vertex we look up the lower vertices
 * sharing its column via the spatial grid and take the smallest positive
 * vertical gap. That smallest gap is the drop distance, so exactly one vertex
 * pair touches and nothing interpenetrates. No bounding boxes involved.
 */
function settleOntoLower(
  ctx: LowerContext,
  bottomLocals: THREE.Vector3[],
  upperCenterLocal: THREE.Vector3,
  transform: RockTransform,
  samples: number
): SettleResult {
  _scaleVec.setScalar(transform.scale);
  _m.compose(transform.position, transform.quaternion, _scaleVec);

  const step = Math.max(1, Math.floor(bottomLocals.length / samples));
  const radiusSq = ctx.cellSize * ctx.cellSize;

  let minGap = Infinity;
  let contactX = ctx.topCenter.x;
  let contactZ = ctx.topCenter.z;

  const consider = (
    wx: number,
    wy: number,
    wz: number,
    lower: THREE.Vector3
  ) => {
    const gap = wy - lower.y;
    if (gap < minGap) {
      minGap = gap;
      contactX = (wx + lower.x) * 0.5;
      contactZ = (wz + lower.z) * 0.5;
    }
  };

  const world = new THREE.Vector3();
  for (let i = 0; i < bottomLocals.length; i += step) {
    world.copy(bottomLocals[i]).applyMatrix4(_m);
    const cx = Math.floor(world.x / ctx.cellSize);
    const cz = Math.floor(world.z / ctx.cellSize);

    for (let gx = -1; gx <= 1; gx++) {
      for (let gz = -1; gz <= 1; gz++) {
        const bucket = ctx.grid.get(`${cx + gx},${cz + gz}`);
        if (!bucket) continue;
        for (const idx of bucket) {
          const lower = ctx.topVerts[idx];
          const dx = world.x - lower.x;
          const dz = world.z - lower.z;
          if (dx * dx + dz * dz <= radiusSq) {
            consider(world.x, world.y, world.z, lower);
          }
        }
      }
    }
  }

  // Rare: the column lookup found nothing (e.g. a very narrow rock perched off
  // to one side). Fall back to the globally nearest lower vertex — still purely
  // vertex based, no bounding box.
  if (!Number.isFinite(minGap)) {
    let bestDistSq = Infinity;
    for (let i = 0; i < bottomLocals.length; i += step) {
      world.copy(bottomLocals[i]).applyMatrix4(_m);
      for (const lower of ctx.topVerts) {
        const dx = world.x - lower.x;
        const dz = world.z - lower.z;
        const d2 = dx * dx + dz * dz;
        if (d2 < bestDistSq) {
          bestDistSq = d2;
          minGap = world.y - lower.y;
          contactX = (world.x + lower.x) * 0.5;
          contactZ = (world.z + lower.z) * 0.5;
        }
      }
    }
  }

  if (!Number.isFinite(minGap)) minGap = 0;
  transform.position.y -= minGap;

  const comWorld = upperCenterLocal.clone().applyMatrix4(
    _m.compose(
      transform.position,
      transform.quaternion,
      _scaleVec.setScalar(transform.scale)
    )
  );

  return {
    contact: new THREE.Vector3(contactX, transform.position.y, contactZ),
    balanceOffset: Math.hypot(comWorld.x - contactX, comWorld.z - contactZ),
  };
}

function orientUpper(
  bottomLocal: THREE.Vector3,
  centerLocal: THREE.Vector3,
  twistRadians: number
): THREE.Quaternion {
  const localUp = centerLocal.clone().sub(bottomLocal).normalize();
  const align = new THREE.Quaternion().setFromUnitVectors(localUp, WORLD_UP);
  const twist = new THREE.Quaternion().setFromAxisAngle(WORLD_UP, twistRadians);
  align.premultiply(twist);
  return align;
}

// ---------------------------------------------------------------------------
// Solver
// ---------------------------------------------------------------------------

export function solvePointContactStack(
  upperObject: THREE.Object3D,
  lowerObject: THREE.Object3D,
  lowerTransform: RockTransform,
  scale: number,
  layerSeed: number
): RockTransform {
  const { orientAttempts, settleSamples, localSampleCap, lowerSampleCap } =
    tuning();

  const ctx = buildLowerContext(lowerObject, lowerTransform, lowerSampleCap);

  const upperLocals = collectLocalVertices(upperObject, localSampleCap);
  const upperBox = boxFromPoints(upperLocals);
  const upperCenterLocal = upperBox.getCenter(new THREE.Vector3());
  const bottomPool = regionPool(upperLocals, upperBox, "bottom");

  let bestTransform: RockTransform | null = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < orientAttempts; attempt++) {
    const rng = createSeededRandom(layerSeed + attempt * 1597);
    const bottomLocal = bottomPool[Math.floor(rng() * bottomPool.length)];
    const twist = rng() * Math.PI * 2;
    const quaternion = orientUpper(bottomLocal, upperCenterLocal, twist);

    // Place the chosen bottom point above the lower rock's top centre, start
    // high, then settle straight down onto the surface.
    const worldBottom = bottomLocal
      .clone()
      .multiplyScalar(scale)
      .applyQuaternion(quaternion);

    const transform: RockTransform = {
      position: new THREE.Vector3(
        ctx.topCenter.x - worldBottom.x,
        ctx.topY + scale - worldBottom.y,
        ctx.topCenter.z - worldBottom.z
      ),
      quaternion,
      scale,
      topAnchor: new THREE.Vector3(),
    };

    const settled = settleOntoLower(
      ctx,
      bottomPool,
      upperCenterLocal,
      transform,
      settleSamples
    );

    // Reward a contact point that sits under the centre of mass (stable
    // balance) and close to the lower rock's crown (tighter nestle).
    const crownOffset = Math.hypot(
      settled.contact.x - ctx.topCenter.x,
      settled.contact.z - ctx.topCenter.z
    );
    const score = settled.balanceOffset + crownOffset * 0.6;

    if (score < bestScore) {
      bestScore = score;
      bestTransform = {
        position: transform.position.clone(),
        quaternion: transform.quaternion.clone(),
        scale,
        topAnchor: new THREE.Vector3(),
      };
    }
  }

  const final = bestTransform ?? {
    position: new THREE.Vector3(ctx.topCenter.x, ctx.topY, ctx.topCenter.z),
    quaternion: new THREE.Quaternion(),
    scale,
    topAnchor: new THREE.Vector3(),
  };

  final.topAnchor = getSingleTopContactPoint(
    upperObject,
    final,
    layerSeed + 9000
  );
  return final;
}

export function getSingleTopContactPoint(
  object: THREE.Object3D,
  transform: RockTransform,
  seed: number
): THREE.Vector3 {
  const rng = createSeededRandom(seed);
  const locals = collectLocalVertices(object, 320);
  const box = boxFromPoints(locals);
  const pool = regionPool(locals, box, "top");
  const local = pool[Math.floor(rng() * pool.length)].clone();
  return localToWorld(local, transform);
}

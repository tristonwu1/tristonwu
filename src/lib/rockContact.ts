import * as THREE from "three";
import { isMobileClient } from "@/lib/clientDevice";
import { createSeededRandom, type RockTransform } from "@/lib/rockPlacement";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const TOP_REGION = 0.34;
const BOTTOM_REGION = 0.34;

function tuning() {
  const mobile = isMobileClient();
  return {
    orientAttempts: mobile ? 6 : 12,
    settleSamples: mobile ? 90 : 150,
    localSampleCap: mobile ? 260 : 420,
  };
}

const _m = new THREE.Matrix4();
const _scaleVec = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3(0, -1, 0);

export type PointContact = {
  lowerWorld: THREE.Vector3;
  upperLocal: THREE.Vector3;
};

// ---------------------------------------------------------------------------
// Geometry sampling (pure helpers)
// ---------------------------------------------------------------------------

/**
 * Vertices in the object's ROOT-local frame — i.e. the frame a RockTransform
 * operates in. The GLB meshes carry their own nested node transforms, so we
 * must bake each mesh's matrix relative to the object root; reading raw
 * geometry positions would place contacts in the wrong space (floating gaps).
 */
function collectLocalVertices(
  object: THREE.Object3D,
  cap = Infinity
): THREE.Vector3[] {
  object.updateMatrixWorld(true);
  const toLocal = new THREE.Matrix4().copy(object.matrixWorld).invert();
  const rel = new THREE.Matrix4();
  const v = new THREE.Vector3();
  const vertices: THREE.Vector3[] = [];

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      rel.multiplyMatrices(toLocal, child.matrixWorld);
      const position = child.geometry.attributes.position;
      const step = Math.max(1, Math.floor(position.count / Math.max(1, cap)));
      for (let i = 0; i < position.count; i += step) {
        v.set(position.getX(i), position.getY(i), position.getZ(i));
        v.applyMatrix4(rel);
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

/** Public: sampled world-space vertices for a transformed object. */
export function sampleWorldVertices(
  object: THREE.Object3D,
  transform: RockTransform,
  maxSamples = 220
): THREE.Vector3[] {
  const locals = collectLocalVertices(object, maxSamples);
  _scaleVec.setScalar(transform.scale);
  _m.compose(transform.position, transform.quaternion, _scaleVec);
  return locals.map((v) => v.applyMatrix4(_m));
}

// ---------------------------------------------------------------------------
// Lower-rock raycast context (built once per solve)
// ---------------------------------------------------------------------------

type LowerContext = {
  meshes: THREE.Mesh[];
  /** World-space vertices in the lower rock's top region (for vertex pairing). */
  topVerts: THREE.Vector3[];
  topCenter: THREE.Vector3;
  topY: number;
};

function buildLowerContext(
  lowerObject: THREE.Object3D,
  lowerTransform: RockTransform
): LowerContext {
  const group = new THREE.Group();
  group.position.copy(lowerTransform.position);
  group.quaternion.copy(lowerTransform.quaternion);
  group.scale.setScalar(lowerTransform.scale);
  group.add(lowerObject.clone(true));
  group.updateMatrixWorld(true);

  const meshes: THREE.Mesh[] = [];
  const box = new THREE.Box3();
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
      child.geometry.computeBoundingBox();
      box.expandByObject(child);
    }
  });

  const span = box.max.y - box.min.y || 1;
  const topThreshold = box.max.y - span * TOP_REGION;
  const topVerts: THREE.Vector3[] = [];
  const center = new THREE.Vector3();
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const pos = child.geometry.attributes.position;
      const step = Math.max(1, Math.floor(pos.count / 120));
      for (let i = 0; i < pos.count; i += step) {
        _rayOrigin.set(pos.getX(i), pos.getY(i), pos.getZ(i));
        _rayOrigin.applyMatrix4(child.matrixWorld);
        if (_rayOrigin.y >= topThreshold) {
          topVerts.push(_rayOrigin.clone());
          center.add(_rayOrigin);
        }
      }
    }
  });
  if (topVerts.length > 0) center.multiplyScalar(1 / topVerts.length);
  else box.getCenter(center);

  return { meshes, topVerts, topCenter: center, topY: box.max.y };
}

function raycastSurfaceY(
  ctx: LowerContext,
  x: number,
  z: number,
  fromY: number
): number | null {
  _rayOrigin.set(x, fromY, z);
  _raycaster.set(_rayOrigin, _rayDir);
  let bestY: number | null = null;
  for (const mesh of ctx.meshes) {
    const hits = _raycaster.intersectObject(mesh, false);
    if (hits.length > 0) {
      const y = hits[0].point.y;
      if (bestY === null || y > bestY) bestY = y;
    }
  }
  return bestY;
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
 * it first touches the lower rock. Contact is detected two ways and we stop at
 * whichever happens first, so there is never interpenetration:
 *   1. A bottom vertex of the upper rock meeting the lower surface (raycast).
 *   2. A bottom vertex of the upper rock meeting a top vertex of the lower rock
 *      (vertex-to-vertex), within a small horizontal radius.
 * A bounding-box fallback guarantees the rock rests on the crown even when no
 * sample lines up, so a stone can never end up floating in space.
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
  // Pair an upper vertex with a lower vertex only when they sit roughly in the
  // same vertical column.
  const pairRadiusSq = (0.16 * transform.scale) ** 2;

  let minGap = Infinity;
  let contactX = ctx.topCenter.x;
  let contactZ = ctx.topCenter.z;

  // Fallback bookkeeping: lowest upper vertex regardless of what is beneath it.
  let lowestY = Infinity;
  let lowestX = ctx.topCenter.x;
  let lowestZ = ctx.topCenter.z;

  for (let i = 0; i < bottomLocals.length; i += step) {
    const world = bottomLocals[i].clone().applyMatrix4(_m);

    if (world.y < lowestY) {
      lowestY = world.y;
      lowestX = world.x;
      lowestZ = world.z;
    }

    const surfaceY = raycastSurfaceY(ctx, world.x, world.z, world.y + 0.001);
    if (surfaceY !== null) {
      const gap = world.y - surfaceY;
      if (gap < minGap) {
        minGap = gap;
        contactX = world.x;
        contactZ = world.z;
      }
    }

    for (const lower of ctx.topVerts) {
      const dx = world.x - lower.x;
      const dz = world.z - lower.z;
      if (dx * dx + dz * dz > pairRadiusSq) continue;
      const gap = world.y - lower.y;
      if (gap >= 0 && gap < minGap) {
        minGap = gap;
        contactX = (world.x + lower.x) * 0.5;
        contactZ = (world.z + lower.z) * 0.5;
      }
    }
  }

  if (!Number.isFinite(minGap)) {
    // Nothing lined up beneath the rock: rest its lowest point on the crown.
    minGap = lowestY - ctx.topY;
    contactX = lowestX;
    contactZ = lowestZ;
  }

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
  const { orientAttempts, settleSamples, localSampleCap } = tuning();

  const ctx = buildLowerContext(lowerObject, lowerTransform);

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

    // Place the chosen bottom point above the lower rock's top centre,
    // start high, then settle straight down onto the surface.
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

  const final =
    bestTransform ??
    {
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

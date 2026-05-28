"use client";

import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import {
  ORTHO_CAMERA_Z,
  computeOrthoZoom,
} from "@/lib/rockStackLayout";

type OrthoCameraSyncProps = {
  viewportHeight: number;
};

/** Keeps orthographic zoom aligned to viewport; camera never pans on scroll. */
export function OrthoCameraSync({ viewportHeight }: OrthoCameraSyncProps) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;

    camera.zoom = computeOrthoZoom(viewportHeight);
    camera.position.set(0, 0, ORTHO_CAMERA_Z);
    camera.near = 0.1;
    camera.far = 200;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, viewportHeight, size.width]);

  return null;
}

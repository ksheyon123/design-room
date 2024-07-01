import { useRef } from "react";
import * as THREE from "three";

export const useLiner = () => {
  const pointRef = useRef<THREE.Vector3[]>([]);
  const lineRef = useRef<{ from: THREE.Vector3; to: THREE.Vector3 }>({
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
  });
  const isClickedRef = useRef<boolean>(false);

  const start = (v: THREE.Vector3) => {
    isClickedRef.current = true;
    lineRef.current = {
      ...lineRef.current,
      from: v,
    };
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    const dot = new THREE.Mesh(geometry, material);
    return dot;
  };

  const end = () => {
    pointRef.current.push();
  };

  const createLine = () => {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry = new THREE.BufferGeometry().setFromPoints(pointRef.current);
    const line = new THREE.Line(geometry, material);
  };

  const onPointKeydown = (e: MouseEvent) => {};
  const onPointKeyup = (e: MouseEvent) => {};

  const add = () => {};
  return {
    start,
  };
};

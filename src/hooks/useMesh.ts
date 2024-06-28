import * as THREE from "three";

export const useMesh = () => {
  const createFloor = (width?: number, height?: number, color?: number) => {
    const geometry = new THREE.PlaneGeometry(width || 1, height || 1);
    const material = new THREE.MeshBasicMaterial({
      color: color || 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    return plane;
  };
  return {
    createFloor,
  };
};

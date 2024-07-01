import { useRef } from "react";
import * as THREE from "three";

export const useRaycaster = (width = 0, height = 0) => {
  const tPointRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const isClickingRef = useRef<boolean>(false);

  const onPointOut = () => {
    isClickingRef.current = false;
  };

  const onPointKeydown = (event: MouseEvent) => {
    tPointRef.current.x = (event.offsetX / width) * 2 - 1;
    tPointRef.current.y = -(event.offsetY / height) * 2 + 1;

    isClickingRef.current = true;
  };
  const onPointKeyup = () => {
    isClickingRef.current = false;
  };

  const getPosition = (scene, camera) => {
    const raycaster = new THREE.Raycaster();
    if (isClickingRef.current) {
      console.log(tPointRef.current);
      raycaster.setFromCamera(tPointRef.current, camera);
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      for (let i = 0; i < intersects.length; i++) {
        const { point } = intersects[i];
        return point;
        // intersects[i].object.material.color.set(0xff0000);
      }
    }
  };

  return {
    onPointOut,
    onPointKeydown,
    onPointKeyup,
    getPosition,
  };
};

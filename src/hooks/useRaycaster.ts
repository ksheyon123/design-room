import { useRef } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";

export const useRaycaster = (
  width = 0,
  height = 0,
  scene?: THREE.Scene,
  camera?: THREE.PerspectiveCamera
) => {
  const { createPlane } = useMesh();
  const pointRef = useRef<{
    from?: THREE.Vector3;
    to?: THREE.Vector3;
  }>();

  const startPointRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const endPointRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const isClickingRef = useRef<boolean>(false);

  const onPointMove = (event: MouseEvent) => {
    endPointRef.current.x = (event.offsetX / width) * 2 - 1;
    endPointRef.current.y = -(event.offsetY / height) * 2 + 1;
    const point = setPosition(endPointRef.current);

    if (point && scene) {
      const dot = createPlane("dot", 1, 1);
      dot.position.set(point.x, point.y, point.z);
      pointRef.current = {
        ...pointRef.current,
        to: dot.position.clone(),
      };
      scene.add(dot);
    }
  };

  const onPointOut = () => {
    isClickingRef.current = false;
  };

  const onPointKeydown = (event: MouseEvent) => {
    startPointRef.current.x = (event.offsetX / width) * 2 - 1;
    startPointRef.current.y = -(event.offsetY / height) * 2 + 1;
    isClickingRef.current = true;

    const point = setPosition(startPointRef.current);

    if (point && scene) {
      const dot = createPlane("dot", 1, 1);
      dot.position.set(point.x, point.y, point.z);
      pointRef.current = {
        from: dot.position.clone(),
      };
      scene.add(dot);
    }
  };
  const onPointKeyup = () => {
    isClickingRef.current = false;
    // setPosition(endPointRef.current);
  };

  const setPosition = (v) => {
    if (camera && scene) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(v, camera);
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      for (let i = 0; i < intersects.length; i++) {
        const { point } = intersects[i];
        isClickingRef.current = false;
        return point;
      }
    }
  };

  const drawLine = () => {
    if (pointRef.current) {
      const arr = Object.values(pointRef.current);
      console.log(arr);
      if (arr.length > 1) {
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints(arr);
        const line = new THREE.Line(geometry, material);
        return line;
      }
    }
  };

  return {
    onPointMove,
    onPointOut,
    onPointKeydown,
    onPointKeyup,
    setPosition,
    drawLine,
  };
};

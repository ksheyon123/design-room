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

  const isClickedRef = useRef<boolean>(false);

  const onKeyHandler = (e: KeyboardEvent) => {
    const { code } = e;
  };

  const onPointMove = (event: MouseEvent) => {
    const x = (event.offsetX / width) * 2 - 1;
    const y = -(event.offsetY / height) * 2 + 1;
    const point = setPosition(new THREE.Vector2(x, y));

    if (point && scene) {
      const dot = createPlane("dot", 1, 1);
      dot.position.set(point.x, point.y, point.z);
      pointRef.current = {
        ...pointRef.current,
        to: dot.position.clone(),
      };
    }
  };

  const onPointOut = () => {
    isClickedRef.current = false;
    const tempLines = scene?.children.filter((el) => el.name === "tempLine");
    if (tempLines) {
      tempLines.map((el) => el.removeFromParent());
    }
  };

  const onPointKeydown = () => {
    isClickedRef.current = !isClickedRef.current;
  };
  const onPointKeyup = (event: MouseEvent) => {
    if (isClickedRef.current) {
      const lines = createLine("line");
      if (lines) {
        scene?.add(lines);
      }
    }

    const x = (event.offsetX / width) * 2 - 1;
    const y = -(event.offsetY / height) * 2 + 1;
    const point = setPosition(new THREE.Vector2(x, y));
    if (point && scene) {
      const dot = createPlane("dot", 1, 1);
      dot.position.set(point.x, point.y, point.z);
      pointRef.current = {
        from: dot.position.clone(),
      };
      scene.add(dot);
      isClickedRef.current = !isClickedRef.current;
    }
  };

  const setPosition = (v) => {
    if (camera && scene) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(v, camera);
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      for (let i = 0; i < intersects.length; i++) {
        const { point } = intersects[i];
        return point;
      }
    }
  };

  // const chk = () => {};

  const createLine = (name = "tempLine") => {
    if (!!pointRef.current?.from && !!pointRef.current?.to) {
      const arr = Object.values(pointRef.current);
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const geometry = new THREE.BufferGeometry().setFromPoints(arr);
      const line = new THREE.Line(geometry, material);
      line.name = name;
      return line;
    }
  };

  const drawTempLine = () => {
    if (scene) {
      const tempLines = scene?.children.filter((el) => el.name === "tempLine");
      tempLines.map((el) => el.removeFromParent());
    }
    const lines = createLine();
    if (lines) {
      scene?.add(lines);
    }
  };

  return {
    onPointMove,
    onPointOut,
    onPointKeydown,
    onPointKeyup,
    setPosition,
    drawTempLine,
  };
};

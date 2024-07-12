import { useRef } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";

type SortOfCode = "Shift" | "MetaLeft" | "Ctrl" | "KeyZ" | "Escape";

export const useRaycaster = (
  width = 0,
  height = 0,
  scene?: THREE.Scene,
  camera?: THREE.PerspectiveCamera
) => {
  const { createPlane } = useMesh();
  const fromPointRef = useRef<THREE.Vector3>();
  const toPointRef = useRef<THREE.Vector3>();

  // For Checking the user click inside of the canvas
  const isClickedRef = useRef<boolean>(false);
  // For Checking the user press the shift key button, shift key only permit vertical and horizontal line
  const isActiveKeys = useRef<{ [key in SortOfCode]?: boolean }>();

  /**
   * @description The setPosition method uses a raycaster to find the exact mouse position by determining the intersection between the mouse coordinates on the component and the virtual vertical ray of the planar object.
   * @param v Current coordinate of mouse
   * @returns intersection coordinate
   */
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

  const onKeydownHandler = (e: KeyboardEvent) => {
    const { code } = e as { code: SortOfCode };
    switch (code) {
      case "Shift":
      case "MetaLeft":
        isActiveKeys.current = {
          ...isActiveKeys.current,
          [code]: true,
        };
    }
  };

  const onKeyupHandler = (e: KeyboardEvent) => {
    const { code } = e as { code: SortOfCode };
    switch (code) {
      case "Shift":
      case "MetaLeft":
        isActiveKeys.current = {
          ...isActiveKeys.current,
          [code]: false,
        };
    }
  };

  const onPointMove = (event: MouseEvent) => {
    // Get mouse coordinate
    const x = (event.offsetX / width) * 2 - 1;
    const y = -(event.offsetY / height) * 2 + 1;
    const point = setPosition(new THREE.Vector2(x, y));

    if (point && scene) {
      const dot = createPlane("dot", 1, 1);
      dot.position.set(point.x, point.y, point.z);
      toPointRef.current = dot.position.clone();
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
      fromPointRef.current = dot.position.clone();
      scene.add(dot);
      isClickedRef.current = !isClickedRef.current;
    }
  };

  const onPointOut = () => {
    isClickedRef.current = false;
    const tempLines = scene?.children.filter((el) => el.name === "tempLine");
    if (tempLines) {
      tempLines.map((el) => el.removeFromParent());
    }
  };

  const createLine = (name = "tempLine") => {
    if (!!fromPointRef.current && !!toPointRef.current) {
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const geometry = new THREE.BufferGeometry().setFromPoints([
        fromPointRef.current,
        toPointRef.current,
      ]);
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
    onKeydownHandler,
    onKeyupHandler,
  };
};

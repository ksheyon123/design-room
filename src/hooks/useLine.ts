import { useContext, useRef } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { ThreeContext } from "@/contexts/ThreeContext";

type SortOfCode = "ShiftLeft" | "MetaLeft" | "Ctrl" | "KeyZ" | "Escape";

export const useLine = (
  width = 0,
  height = 0,
  scene?: THREE.Scene,
  camera?: THREE.PerspectiveCamera
) => {
  let { meshes } = useContext(ThreeContext);
  const { getVertices } = useMesh();
  const fromPointRef = useRef<THREE.Vector3 | null>(null);
  const cursorPRef = useRef<THREE.Vector3 | null>(null);
  const toPointRef = useRef<THREE.Vector3 | null>(null);

  // For Checking the user click inside of the canvas
  const isClickedRef = useRef<boolean>(false);
  // For Checking the user press the shift key button, shift key only permit vertical and horizontal line
  const isActiveKeys = useRef<{ [key in SortOfCode]?: boolean }>();

  /**
   * @description The setPosition method uses a raycaster to find the exact mouse position by determining the intersection between the mouse coordinates on the component and the virtual vertical ray of the planar object.
   * @param v Current coordinate of mouse
   * @returns intersection coordinate
   */
  const getIntersectPoint = (v: THREE.Vector2, name = "floor") => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(v, camera!);
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(
      scene!.children.filter((el) => el.name === name)
    );

    for (let i = 0; i < intersects.length; i++) {
      const { point, object } = intersects[i];
      return { point, object };
    }
  };

  const calAngle = (from: THREE.Vector3, to: THREE.Vector3) => {
    if (from && to) {
      // Calculate the differences in x and y coordinates
      const dx = to.x - from.x;
      const dy = to.y - from.y;

      // Calculate the angle in radians and convert to degrees
      const angleInRadians = Math.atan2(dy, dx);
      const angleInDegrees = THREE.MathUtils.radToDeg(angleInRadians);

      return angleInDegrees;
    }
    return null;
  };

  const onKeydownHandler = (e: KeyboardEvent) => {
    const { code } = e as { code: SortOfCode };
    switch (code) {
      case "ShiftLeft":
        isActiveKeys.current = {
          ...isActiveKeys.current,
          [code]: true,
        };
      case "MetaLeft":
        isActiveKeys.current = {
          ...isActiveKeys.current,
          [code]: true,
        };
        fromPointRef.current = null;
        toPointRef.current = null;
    }
  };

  const onKeyupHandler = (e: KeyboardEvent) => {
    const { code } = e as { code: SortOfCode };
    switch (code) {
      case "ShiftLeft":
      case "MetaLeft":
        isActiveKeys.current = {
          ...isActiveKeys.current,
          [code]: false,
        };
    }
  };

  /**
   * @description Get mouse point coordinate and set it to the ref
   * @param event
   */
  const onPointMove = (event: MouseEvent) => {
    // Get mouse coordinate
    let x = (event.offsetX / width) * 2 - 1;
    let y = -(event.offsetY / height) * 2 + 1;

    const data = getIntersectPoint(new THREE.Vector2(x, y));
    const point = data?.point;
    if (point) {
      cursorPRef.current = point.clone();
    }
  };

  const onPointKeydown = (event) => {
    const x = (event.offsetX / width) * 2 - 1;
    const y = -(event.offsetY / height) * 2 + 1;
    const data = getIntersectPoint(new THREE.Vector2(x, y));
    const point = data?.point;

    if (!isClickedRef.current) {
      if (point) {
        fromPointRef.current = point.clone();
      }
    }

    isClickedRef.current = !isClickedRef.current;
  };

  const onPointKeyup = (event: MouseEvent) => {
    if (isClickedRef.current) {
      const x = (event.offsetX / width) * 2 - 1;
      const y = -(event.offsetY / height) * 2 + 1;
      const data = getIntersectPoint(new THREE.Vector2(x, y));
      const point = data?.point;
      if (point) {
        toPointRef.current = point.clone();
      }

      isClickedRef.current = !isClickedRef.current;
    }
  };

  const getRef = () => {
    return {
      from: fromPointRef.current,
      to: toPointRef.current,
      cursor: cursorPRef.current,
    };
  };

  const getNearest = (point: THREE.Vector3 | null) => {
    if (point) {
      const { lines } = meshes;
      if (lines.length > 0) {
        let inRange: THREE.Vector3[] = [];
        lines.map((line) => {
          const [start, end] = getVertices(line);
          const startPoint = new THREE.Vector3(start.x, start.y, 0);
          const endPoint = new THREE.Vector3(end.x, end.y, 0);

          if (startPoint.distanceTo(point) < 2) {
            inRange.push(startPoint);
            return startPoint;
          } else if (endPoint.distanceTo(point) < 2) {
            inRange.push(endPoint);
          }
        });
        if (inRange.length > 0) {
          return new THREE.Vector3(inRange[0].x, inRange[0].y, 0);
        }
      }
      return point;
    }
  };

  const convertCoord = (event) => {
    const x = (event.offsetX / width) * 2 - 1;
    const y = -(event.offsetY / height) * 2 + 1;
    const data = getIntersectPoint(new THREE.Vector2(x, y));
    const point = data?.point;
    return point;
  };

  const getPointerToLineDistance = (line, to) => {
    const { x: x0, y: y0 } = to;
    const point = new THREE.Vector3(x0, y0, 0);
    const [start, end] = getVertices(line);
    const lineVector = new THREE.Vector3().subVectors(end, start);
    const v = new THREE.Vector3().subVectors(point, end);
    const crossProduct = new THREE.Vector3().crossVectors(lineVector, v);
    const distance = crossProduct.length() / lineVector.length();
    return distance;
  };

  const changeLineColor = (event) => {
    const point = convertCoord(event);
    const { lines } = meshes;
    const linesWithDistance = lines.map((line) => {
      const distance = getPointerToLineDistance(line, point);
      return {
        line,
        distance,
      };
    });
    if (point && linesWithDistance.length > 0) {
      const { line, distance } = linesWithDistance.reduce((prev, curr) =>
        prev.distance < curr.distance ? prev : curr
      );
      // Command Key 클릭 후 Keydown 시
      if (isActiveKeys.current?.MetaLeft) {
        (line as any).material.color.set(0xff0000);
        line.userData.isActive = !line.userData.isActive;
        // Mouse Cursor와 line 사이의 간격이 0.5 pixel 이하인 경우,
      } else if (distance < 0.5) {
        (line as any).material.color.set(0xff0000);
      } else {
        // 그 외의 경우 색상 원상 복구
        linesWithDistance.map(({ line: otherLine }) => {
          if (!otherLine.userData.isActive) {
            (otherLine as any).material.color.set(0x000000);
          }
        });
      }
    }
  };

  const remover = () => {
    let { lines } = meshes;
    let newLines: any[] = [];
    lines.map((el) => {
      if (el.userData.isActive) {
        el.removeFromParent();
      } else {
        newLines.push(el);
      }
    });
    meshes.lines = newLines;
  };

  const chkLeftShift = (from, to) => {
    if (from && to) {
      if (isActiveKeys.current?.ShiftLeft || false) {
        const angle = calAngle(from, to);
        if (angle) {
          if (angle < 45 && -45 <= angle) {
            return {
              to: {
                ...to,
                y: from.y || 0,
              },
            };
          } else if (angle < -45 && -135 <= angle) {
            return {
              to: {
                ...to,
                x: from.x,
              },
            };
          } else if (angle >= 45 && angle < 135) {
            return {
              to: {
                ...to,
                x: from.x,
              },
            };
          } else if (
            (180 >= angle && angle >= 135) ||
            (-180 <= angle && angle <= -135)
          ) {
            return {
              to: {
                ...to,
                y: from.y,
              },
            };
          }
        }
      }
    }
    return {
      to,
    };
  };

  /**
   * @description Draw the line using from and to coordinate
   * @param name (default tempLine) indicate line type
   * @returns line object
   */
  const createLineMaterial = (from, to, name = "tempLine") => {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(geometry, material);
    line.name = name;
    return line;
  };

  const drawGuidance = (from, cursor) => {
    const { tempLine } = meshes;
    if (tempLine) {
      tempLine.removeFromParent();
    }
    if (isClickedRef.current && from && cursor) {
      const line = createLineMaterial(from, cursor, "tempLine");
      meshes.tempLine = line;
      return line;
    }
  };

  const drawLine = (from, to) => {
    if (!isClickedRef.current && from && to) {
      const line = createLineMaterial(from, to, "line");
      const { lines } = meshes;
      lines.push(line);
      fromPointRef.current = null;
      toPointRef.current = null;
      return line;
    }
  };

  return {
    getRef,

    onPointMove,
    onPointKeydown,
    onPointKeyup,
    onKeydownHandler,
    onKeyupHandler,

    getIntersectPoint,
    chkLeftShift,
    changeLineColor,
    drawGuidance,
    drawLine,
    getNearest,
    remover,
  };
};

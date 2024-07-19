import { useRef } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";

type SortOfCode = "ShiftLeft" | "MetaLeft" | "Ctrl" | "KeyZ" | "Escape";

type LineType = THREE.Line<
  THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  THREE.LineBasicMaterial,
  THREE.Object3DEventMap
>;

export const useLine = (
  width = 0,
  height = 0,
  scene?: THREE.Scene,
  camera?: THREE.PerspectiveCamera
) => {
  const { createDot, getVertices } = useMesh();
  const fromPointRef = useRef<THREE.Vector3 | null>();
  const cursorPRef = useRef<THREE.Vector3 | null>();
  const toPointRef = useRef<THREE.Vector3 | null>();

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
    if (camera && scene) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(v, camera);
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(
        scene.children.filter((el) => el.name === name)
      );

      for (let i = 0; i < intersects.length; i++) {
        const { point, object } = intersects[i];
        return { point, object };
      }
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
    if (!isClickedRef.current) {
      const x = (event.offsetX / width) * 2 - 1;
      const y = -(event.offsetY / height) * 2 + 1;
      const data = getIntersectPoint(new THREE.Vector2(x, y));
      const point = data?.point;
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

  const onPointOut = () => {
    isClickedRef.current = false;
    const tempLines = scene?.children.filter((el) => el.name === "tempLine");
    if (tempLines) {
      tempLines.map((el) => el.removeFromParent());
    }
  };

  const distanceFromPointToLine = (x1, y1, x2, y2, x0, y0) => {
    const numerator = Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1));
    const denominator = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return numerator / denominator;
  };

  const getPointerToLineDistance = (to) => {
    const lines = scene?.children.filter(
      (el: any) => el.name === "line"
    ) as LineType[];
    if (lines && to) {
      const { x: x0, y: y0 } = to;

      let arr: { line: LineType; distance: number }[] = new Array();
      lines.map((line) => {
        const [start, end] = getVertices(line);
        const { x: x1, y: y1 } = start;
        const { x: x2, y: y2 } = end;
        const distance = distanceFromPointToLine(x1, y1, x2, y2, x0, y0);
        if (distance) {
          arr.push({ line, distance });
        }
      });

      return arr;
    }
  };

  const getNearest = (point: THREE.Vector3) => {
    const lines = scene?.children.filter(
      (el: any) => el.name === "line"
    ) as LineType[];
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
        console.log(inRange);
        return new THREE.Vector3(inRange[0].x, inRange[0].y, 0);
      }
    }
    return point;
  };

  const outliner = (to) => {
    const linesWithDistance = getPointerToLineDistance(to);
    if (linesWithDistance && linesWithDistance.length > 0) {
      const { line, distance } = linesWithDistance.reduce((prev, curr) =>
        prev.distance < curr.distance ? prev : curr
      );
      if (distance < 0.5) {
        line.material.color.set(0x000000);
      } else {
        linesWithDistance.map(({ line }) => line.material.color.set(0xff0000));
      }
    }
  };

  const chkLeftShift = (from, to) => {
    if (from && to) {
      let returnValue = {
        x: to.x,
        y: to.y,
      };
      if (isActiveKeys.current?.ShiftLeft || false) {
        const angle = calAngle(from, to);
        if (angle) {
          if (angle < 45 && -45 <= angle) {
            return {
              ...returnValue,
              y: from.y || 0,
            };
          } else if (angle < -45 && -135 <= angle) {
            return {
              ...returnValue,
              x: from.x,
            };
          } else if (angle >= 45 && angle < 135) {
            return {
              ...returnValue,
              x: from.x,
            };
          } else if (
            (180 >= angle && angle >= 135) ||
            (-180 >= angle && angle <= -135)
          ) {
            return {
              ...returnValue,
              y: from.y || 0,
            };
          }
        }
      }
      return returnValue;
    }
  };

  /**
   * @description Draw the line using from and to coordinate
   * @param name (default tempLine) indicate line type
   * @returns line object
   */
  const createLineMaterial = (from, to, name = "tempLine") => {
    if (!!from && !!to) {
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
      const line = new THREE.Line(geometry, material);
      line.name = name;
      return line;
    }
  };

  const drawLine = (scene, from, to) => {
    const tempLines = scene?.children.filter((el) => el.name === "tempLine");
    tempLines.map((el) => el?.removeFromParent());

    if (isClickedRef.current && to) {
      console.log("DRAW : ", to);
      const lines = createLineMaterial(from, to);
      scene?.add(lines);
    } else {
      if (from && to) {
        const lines = createLineMaterial(from, to, "line");
        scene?.add(lines);
        fromPointRef.current = null;
        toPointRef.current = null;
      }
    }
  };

  return {
    getRef,

    onPointMove,
    onPointOut,
    onPointKeydown,
    onPointKeyup,
    onKeydownHandler,
    onKeyupHandler,
    getIntersectPoint,
    chkLeftShift,
    outliner,
    drawLine,
    getNearest,
  };
};

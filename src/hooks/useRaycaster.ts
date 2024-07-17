import { useRef } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";

type SortOfCode = "ShiftLeft" | "MetaLeft" | "Ctrl" | "KeyZ" | "Escape";

type LineType = THREE.Line<
  THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  THREE.LineBasicMaterial,
  THREE.Object3DEventMap
>;

export const useRaycaster = (
  width = 0,
  height = 0,
  scene?: THREE.Scene,
  camera?: THREE.PerspectiveCamera
) => {
  const { createDot, getVertices } = useMesh();
  const fromPointRef = useRef<THREE.Vector3 | null>();
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

  const calAngle = () => {
    const from = fromPointRef.current;
    const to = toPointRef.current;
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

    if (scene) {
      const point =
        setPosition(new THREE.Vector3(x, y, 0)) || new THREE.Vector3();
      const dots = scene.children.filter((el: any) => el.name === "line-dot");
      const [obj] = dots.filter((el) => {
        const tP = el.position.clone();
        if (
          distanceFromPointToPoint(tP, new THREE.Vector3(point.x, point.y, 0)) <
          1
        ) {
          return el;
        }
      });
      if (obj) {
        toPointRef.current = obj.position.clone();
      } else {
        toPointRef.current = point.clone();
      }
    }
  };

  const distanceFromPointToPoint = (p0: THREE.Vector3, p1: THREE.Vector3) => {
    return p0.distanceTo(p1);
  };

  const onPointKeydown = (event) => {
    if (!isClickedRef.current) {
      const x = (event.offsetX / width) * 2 - 1;
      const y = -(event.offsetY / height) * 2 + 1;
      const point = setPosition(new THREE.Vector3(x, y, 0));
      if (point && scene) {
        console.log(point);
        const dots = scene.children.filter((el: any) => el.name === "line-dot");
        const [obj] = dots.filter((el) => {
          const tP = el.position.clone();
          if (
            distanceFromPointToPoint(
              tP,
              new THREE.Vector3(point.x, point.y, 0)
            ) < 1
          ) {
            return el;
          }
        });
        // setInvisibleDot(x, y, 0);
        if (obj) {
          fromPointRef.current = obj.position.clone();
        } else {
          fromPointRef.current = point.clone();
        }
      }
    }

    isClickedRef.current = !isClickedRef.current;
  };

  const onPointKeyup = (event: MouseEvent) => {
    if (isClickedRef.current) {
      const lines = createLine(
        fromPointRef.current,
        toPointRef.current,
        "line"
      );
      if (lines) {
        const { x, y } = toPointRef.current!;
        console.log(x, y);
        // setInvisibleDot(x, y, 0);
        scene?.add(lines);
      }
    }
    fromPointRef.current = null;
    toPointRef.current = null;
    isClickedRef.current = !isClickedRef.current;
  };

  const onPointOut = () => {
    isClickedRef.current = false;
    const tempLines = scene?.children.filter((el) => el.name === "tempLine");
    if (tempLines) {
      tempLines.map((el) => el.removeFromParent());
    }
  };

  const setInvisibleDot = (x, y, z) => {
    const dot = createDot();
    dot.position.set(x, y, z);
    dot.name = "line-dot";
    scene?.add(dot);
  };

  const distanceFromPointToLine = (x1, y1, x2, y2, x0, y0) => {
    const numerator = Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1));
    const denominator = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return numerator / denominator;
  };

  const getPointerToLineDistance = () => {
    const lines = scene?.children.filter(
      (el: any) => el.name === "line"
    ) as LineType[];
    const dots = scene?.children.filter((el: any) => el.name === "line-dot");
    if (lines && toPointRef.current) {
      const { x: x0, y: y0 } = toPointRef.current;

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

  const outliner = () => {
    const linesWithDistance = getPointerToLineDistance();
    if (linesWithDistance && linesWithDistance.length > 0) {
      const { line, distance } = linesWithDistance.reduce((prev, curr) =>
        prev.distance < curr.distance ? prev : curr
      );
      if (!(distance < 0.5)) {
        line.material.color.set(0x000000);
      } else {
        linesWithDistance.map(({ line }) => line.material.color.set(0xff0000));
      }
    }
  };

  const chkLeftShift = () => {
    let returnValue = {
      x: toPointRef.current?.x,
      y: toPointRef.current?.y,
    };
    const angle = calAngle();
    if (isActiveKeys.current?.ShiftLeft || false) {
      if (angle) {
        if (angle < 45 && -45 <= angle) {
          returnValue = {
            ...returnValue,
            y: fromPointRef.current?.y || 0,
          };
        } else if (angle < -45 && -135 <= angle) {
          returnValue = {
            ...returnValue,
            x: fromPointRef.current?.x,
          };
        } else if (angle >= 45 && angle < 135) {
          returnValue = {
            ...returnValue,
            x: fromPointRef.current?.x,
          };
        } else if (
          (180 >= angle && angle >= 135) ||
          (-180 >= angle && angle <= -135)
        ) {
          returnValue = {
            ...returnValue,
            y: fromPointRef.current?.y || 0,
          };
        }
      }
      toPointRef.current = new THREE.Vector3(returnValue.x, returnValue.y, 0);
    }
  };

  /**
   * @description Draw the line using from and to coordinate
   * @param name (default tempLine) indicate line type
   * @returns line object
   */
  const createLine = (from, to, name = "tempLine") => {
    if (!!from && !!to) {
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
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

    const lines = createLine(fromPointRef.current, toPointRef.current);
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
    chkLeftShift,
    outliner,
  };
};

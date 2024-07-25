"use client";

import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { ThreeContext } from "@/contexts/ThreeContext";
import { useCamera } from "@/hooks/useCamera";
import { useLine } from "@/hooks/useLine";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useMesh } from "@/hooks/useMesh";

const ThreeView: React.FC = () => {
  const { scene, camera, renderer } = useContext(ThreeContext);
  const {
    onMouseKeydown,
    onMouseKeyup,
    onMouseMove,
    createPlane,
    getCoord,
    addHeight,
  } = useMesh(scene, camera);
  const {
    zoomCamera,
    moveCamera,
    handleMouseDownEvent,
    handleMouseUpEvent,
    handleMouseMoveEvent,
  } = useCamera();
  const {
    getRef,
    onPointKeydown,
    onPointKeyup,
    onPointMove,
    getIntersectPoint,
  } = useLine(window.innerWidth, window.innerHeight, scene, camera);
  const canvasRef = useRef<HTMLDivElement>();

  const [isRendered, setIsRendered] = useState<boolean>(false);

  useEffect(() => {
    if (renderer && scene && camera) {
      canvasRef.current && canvasRef.current.appendChild(renderer.domElement);
      // const plane = createPlane(
      //   "floor",
      //   window.innerWidth,
      //   window.innerHeight,
      //   0xffffff
      // );

      // scene.add(plane);

      const controls = new OrbitControls(camera, renderer.domElement);
      camera.position.set(0, 10, 30);
      // camera.lookAt(new THREE.Vector3(0, 0, 0));
      controls.update();

      let handleId: any;
      const animate = () => {
        handleId = requestAnimationFrame(animate);
        const coord = getCoord();
        if (coord) {
          const intersect = getIntersectPoint(
            new THREE.Vector2(coord.x, coord.y),
            "plane"
          );
          if (intersect) {
            const { object } = intersect;
          }
        }
        // addHeight();
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
      setIsRendered(true);
      return () => cancelAnimationFrame(handleId);
    }
  }, [renderer, scene, camera]);

  useEffect(() => {
    const mouseMoveEvent = onMouseMove();
    if (isRendered) {
      const ref = canvasRef.current;
      if (ref) {
        const handleMouseWheelEvent = (e: WheelEvent) => {
          if (e.deltaY > 0) {
            zoomCamera(camera!, true);
          }

          if (e.deltaY < 0) {
            zoomCamera(camera!, false);
          }
        };

        ref.addEventListener("mousedown", (e) => {
          handleMouseDownEvent(e);
          onMouseKeydown(e);
        });
        ref.addEventListener("mouseup", (e) => {
          handleMouseUpEvent(e);
          onMouseKeyup();
        });
        ref.addEventListener("mousemove", (e) => {
          handleMouseMoveEvent(e);
          mouseMoveEvent(e);
        });
        ref.addEventListener("mouseout", handleMouseUpEvent);
        ref.addEventListener("wheel", handleMouseWheelEvent);
        return () => {
          ref.removeEventListener("mousedown", (e) => {
            handleMouseDownEvent(e);
            onMouseKeydown(e);
          });
          ref.removeEventListener("mouseup", (e) => {
            handleMouseUpEvent(e);
            onMouseKeyup();
          });
          ref.removeEventListener("mousemove", (e) => {
            handleMouseMoveEvent(e);
            mouseMoveEvent(e);
          });
          ref.removeEventListener("mouseout", handleMouseUpEvent);
          ref.removeEventListener("wheel", handleMouseWheelEvent);
        };
      }
    }
  }, [isRendered, canvasRef]);
  return (
    <>
      <div>onClick</div>
      <div ref={canvasRef as RefObject<HTMLDivElement>} />
    </>
  );
};

export { ThreeView };

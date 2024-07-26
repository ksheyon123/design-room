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
    onKeyboardKeydown,
    onKeyboardKeyup,
    // createPlane,
    getCoord,
    addHeight,
    outliner,
    setCreatedObj,
  } = useMesh(scene, camera);
  const {
    zoomCamera,
    moveCamera,
    handleMouseDownEvent,
    handleMouseUpEvent,
    handleMouseMoveEvent,
  } = useCamera();
  const { getIntersectPoint } = useLine(
    window.innerWidth,
    window.innerHeight,
    scene,
    camera
  );
  const canvasRef = useRef<HTMLDivElement>();
  const [isRendered, setIsRendered] = useState<boolean>(false);

  useEffect(() => {
    if (renderer && scene && camera) {
      const initialPosition = new THREE.Vector3(0, 0, 100);
      canvasRef.current && canvasRef.current.appendChild(renderer.domElement);
      camera.position.set(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z
      );

      let handleId: any;
      const animate = () => {
        handleId = requestAnimationFrame(animate);
        const { isMetaLeft } = getCoord();
        if (!isMetaLeft) {
          const { x, y, z } = moveCamera(new THREE.Vector3(0, 0, 0));
          camera.position.set(x, y, z);
          camera.lookAt(0, 0, 0);
        }

        const tempMesh = addHeight();
        if (tempMesh) {
          scene.add(tempMesh);
        }
        outliner(scene, camera);
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
        window.addEventListener("keydown", onKeyboardKeydown);
        window.addEventListener("keyup", onKeyboardKeyup);
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
          window.removeEventListener("keydown", onKeyboardKeydown);
          window.removeEventListener("keyup", onKeyboardKeyup);
        };
      }
    }
  }, [isRendered, canvasRef]);
  return (
    <>
      <div
        onClick={() => {
          // selectObj();
          setCreatedObj();
        }}
      >
        Click
      </div>
      <div ref={canvasRef as RefObject<HTMLDivElement>} />
    </>
  );
};

export { ThreeView };

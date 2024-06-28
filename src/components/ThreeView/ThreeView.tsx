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
import { useMesh } from "@/hooks/useMesh";

const ThreeView: React.FC = () => {
  const { scene, camera, renderer } = useContext(ThreeContext);
  const { createFloor } = useMesh();
  const {
    zoomCamera,
    moveCamera,
    handleMouseDownEvent,
    handleMouseUpEvent,
    handleMouseMoveEvent,
  } = useCamera();
  const canvasRef = useRef<HTMLDivElement>();

  const [isRendered, setIsRendered] = useState<boolean>(false);

  useEffect(() => {
    if (renderer && scene && camera) {
      canvasRef.current && canvasRef.current.appendChild(renderer.domElement);
      const plane = createFloor(100, 100);
      plane.rotateX(90);
      scene.add(plane);

      // camera.position.set(0, 10, 30);
      let handleId: any;
      const animate = () => {
        handleId = requestAnimationFrame(animate);

        const { x, y, z } = moveCamera(new THREE.Vector3(0, 0, 0));
        camera.position.set(x, y, z);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        renderer.render(scene, camera);
      };
      animate();
      setIsRendered(true);
      return () => cancelAnimationFrame(handleId);
    }
  }, [renderer, scene, camera]);

  useEffect(() => {
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
        });
        ref.addEventListener("mouseup", (e) => {
          handleMouseUpEvent(e);
        });
        ref.addEventListener("mousemove", (e) => {
          handleMouseMoveEvent(e);
        });
        ref.addEventListener("mouseout", handleMouseUpEvent);
        ref.addEventListener("wheel", handleMouseWheelEvent);
        return () => {
          ref.removeEventListener("mousedown", (e) => {
            handleMouseDownEvent(e);
          });
          ref.removeEventListener("mouseup", (e) => {
            handleMouseUpEvent(e);
          });
          ref.removeEventListener("mousemove", (e) => {
            handleMouseMoveEvent(e);
          });
          ref.removeEventListener("mouseout", handleMouseUpEvent);
          ref.removeEventListener("wheel", handleMouseWheelEvent);
        };
      }
    }
  }, [isRendered, canvasRef]);

  return <div ref={canvasRef as RefObject<HTMLDivElement>} />;
};

export { ThreeView };

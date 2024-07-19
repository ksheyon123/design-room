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
import { useMesh } from "@/hooks/useMesh";

const ThreeView: React.FC = () => {
  const { scene, camera, renderer } = useContext(ThreeContext);
  const { createPlane } = useMesh();
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
      const plane = createPlane(
        "floor",
        window.innerWidth,
        window.innerHeight,
        0xffffff
      );

      scene.add(plane);

      camera.position.set(0, 0, 30);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      let handleId: any;
      const animate = () => {
        handleId = requestAnimationFrame(animate);

        const { from } = getRef();
        if (from) {
          const data = getIntersectPoint(
            new THREE.Vector2(from.x, from.y),
            "plane"
          );
          // console.log(data?.object);
        }

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
          onPointKeydown(e);
        });
        ref.addEventListener("mouseup", (e) => {
          handleMouseUpEvent(e);
          onPointKeyup(e);
        });
        ref.addEventListener("mousemove", (e) => {
          handleMouseMoveEvent(e);
          onPointMove(e);
        });
        ref.addEventListener("mouseout", handleMouseUpEvent);
        ref.addEventListener("wheel", handleMouseWheelEvent);
        return () => {
          ref.removeEventListener("mousedown", (e) => {
            handleMouseDownEvent(e);
            onPointKeydown(e);
          });
          ref.removeEventListener("mouseup", (e) => {
            handleMouseUpEvent(e);
            onPointKeyup(e);
          });
          ref.removeEventListener("mousemove", (e) => {
            handleMouseMoveEvent(e);
            onPointMove(e);
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

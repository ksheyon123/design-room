import { useCamera } from "@/hooks/useCamera";
import { useMesh } from "@/hooks/useMesh";
import { useRenederer } from "@/hooks/useRenderer";
import React, { RefObject, useEffect, useRef } from "react";

import * as THREE from "three";

interface IProps {}

export const Drawer: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>();
  const { createCamera } = useCamera();
  const { createRenderer } = useRenederer();
  const { createFloor } = useMesh();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer();
    canvasRef.current && canvasRef.current.appendChild(renderer.domElement);
    const plane = createFloor(10, 10);
    plane.rotateX(90);
    scene.add(plane);
    camera.position.set(0, 20, 0);

    // camera.position.set(0, 10, 30);
    let handleId: any;
    const animate = () => {
      handleId = requestAnimationFrame(animate);

      renderer.render(scene, camera);
    };
    animate();
    return () => cancelAnimationFrame(handleId);
  }, []);

  return <div ref={canvasRef as RefObject<HTMLDivElement>} />;
};

"use client";

import { ThreeContext } from "@/contexts/ThreeContext";
import { useMesh } from "@/hooks/useMesh";
import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const ThreeView: React.FC = () => {
  const { scene, camera, renderer } = useContext(ThreeContext);
  const { createFloor } = useMesh();
  const canvasRef = useRef<HTMLDivElement>();

  const [isRendered, setIsRendered] = useState<boolean>(false);

  useEffect(() => {
    if (renderer) {
      canvasRef.current && canvasRef.current.appendChild(renderer.domElement);
      setIsRendered(true);
    }
  }, [renderer]);

  useEffect(() => {
    if (isRendered && scene && camera && renderer) {
      const plane = createFloor();
      scene.add(plane);
      camera.position.set(0, 10, 30);
      let handleId: any;
      const animate = () => {
        handleId = requestAnimationFrame(animate);

        renderer.render(scene, camera);
      };
      animate();
      return () => cancelAnimationFrame(handleId);
    }
  }, [isRendered, scene, camera, renderer]);

  return <div ref={canvasRef as RefObject<HTMLDivElement>} />;
};

export { ThreeView };

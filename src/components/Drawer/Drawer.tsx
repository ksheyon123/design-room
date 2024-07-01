import React, { RefObject, useEffect, useRef, useState } from "react";

import * as THREE from "three";

import { useCamera } from "@/hooks/useCamera";
import { useMesh } from "@/hooks/useMesh";
import { useRenederer } from "@/hooks/useRenderer";

import * as styles from "./Drawer.module.css";
import styled from "styled-components";
import { useRaycaster } from "@/hooks/useRaycaster";
import { useLiner } from "@/hooks/useLiner";

interface IProps {
  onClick: Function;
  width?: number;
  height?: number;
}

export const Drawer: React.FC<IProps> = ({ width, height, onClick }) => {
  const canvasRef = useRef<HTMLDivElement>();
  const { createCamera, moveCamera } = useCamera();
  const { createRenderer } = useRenederer();
  const { createFloor, createOutline } = useMesh();
  const { start } = useLiner();
  const { onPointKeydown, onPointKeyup, getPosition } = useRaycaster(
    width,
    height
  );

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (canvasRef) {
      setIsMounted(true);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (isMounted) {
      // const d = createPlaidTexture();
      const scene = new THREE.Scene();
      const camera = createCamera(width, height);
      const renderer = createRenderer(width, height);
      canvasRef.current && canvasRef.current.appendChild(renderer.domElement);

      const plane = createFloor("floor", width, height, 0xffffff);
      scene.add(plane);

      let handleId: any;
      const animate = () => {
        handleId = requestAnimationFrame(animate);

        camera.position.set(0, 0, 30);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        const v = getPosition(scene, camera);
        if (v) {
          const dot = start(v);
          dot.position.set(v.x, v.y, v.z);
          scene.add(dot);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => cancelAnimationFrame(handleId);
    }
  }, [isMounted]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener("mousedown", onPointKeydown);
      canvasRef.current.addEventListener("mouseup", onPointKeyup);
      return () => {
        canvasRef.current?.removeEventListener("mousedown", onPointKeydown);
        canvasRef.current?.removeEventListener("mouseup", onPointKeyup);
      };
    }
  }, [canvasRef.current]);

  return (
    <StyledDrawer $width={width} $height={height}>
      <div ref={canvasRef as RefObject<HTMLDivElement>} />
    </StyledDrawer>
  );
};

const StyledDrawer = styled.div<{ $width?: number; $height?: number }>`
  border-top: 1px solid #aaa;
  width: ${(props) => `${props.$width}px` || "100%"};
  height: ${(props) => `${props.$height}px` || "100%"};
`;

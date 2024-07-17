import React, { RefObject, useEffect, useRef, useState } from "react";

import * as THREE from "three";

import { useCamera } from "@/hooks/useCamera";
import { useMesh } from "@/hooks/useMesh";
import { useRenederer } from "@/hooks/useRenderer";

import styled from "styled-components";
import { useRaycaster } from "@/hooks/useRaycaster";
import { useLiner } from "@/hooks/useLiner";
import { ToolBox } from "@/components/ToolBox/ToolBox";

interface IProps {
  onClick: Function;
  width?: number;
  height?: number;
}

export const Drawer: React.FC<IProps> = ({ width, height, onClick }) => {
  const canvasRef = useRef<HTMLDivElement>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();

  const { createCamera, moveCamera } = useCamera();
  const { createRenderer } = useRenederer();
  const { createPlane, createOutline } = useMesh();
  const { start } = useLiner();
  const {
    onPointMove,
    onPointKeydown,
    onPointKeyup,
    setPosition,
    outliner,
    onPointOut,
    drawTempLine,
    onKeydownHandler,
    onKeyupHandler,
    chkLeftShift,
  } = useRaycaster(width, height, sceneRef.current, cameraRef.current);

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (canvasRef) {
      setIsMounted(true);
      const scene = new THREE.Scene();
      const camera = createCamera(width, height);
      sceneRef.current = scene;
      cameraRef.current = camera;
    }
  }, [canvasRef]);

  useEffect(() => {
    if (isMounted) {
      const renderer = createRenderer(width, height);
      canvasRef.current && canvasRef.current.appendChild(renderer.domElement);

      const plane = createPlane("floor", width, height, 0xffffff);
      sceneRef.current!.add(plane);

      let handleId: any;
      const animate = () => {
        handleId = requestAnimationFrame(animate);

        cameraRef.current!.position.set(0, 0, 50);
        cameraRef.current!.lookAt(new THREE.Vector3(0, 0, 0));
        outliner();
        chkLeftShift();
        drawTempLine();

        renderer.render(sceneRef.current!, cameraRef.current!);
      };
      animate();
      return () => cancelAnimationFrame(handleId);
    }
  }, [isMounted]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener("mousedown", onPointKeydown);
      canvasRef.current.addEventListener("mousemove", onPointMove);
      canvasRef.current.addEventListener("mouseup", onPointKeyup);
      canvasRef.current.addEventListener("mouseout", onPointOut);
      window.addEventListener("keydown", onKeydownHandler);
      window.addEventListener("keyup", onKeyupHandler);
      return () => {
        canvasRef.current?.removeEventListener("mousedown", onPointKeydown);
        canvasRef.current?.removeEventListener("mousemove", onPointMove);
        canvasRef.current?.removeEventListener("mouseup", onPointKeyup);
        canvasRef.current?.removeEventListener("mouseout", onPointOut);
        window.addEventListener("keydown", onKeydownHandler);
        window.addEventListener("keyup", onKeyupHandler);
      };
    }
  }, [canvasRef.current]);

  return (
    <StyledDrawer $width={width} $height={height}>
      {sceneRef.current && <ToolBox scene={sceneRef.current} />}
      <div>
        <div ref={canvasRef as RefObject<HTMLDivElement>} />
      </div>
    </StyledDrawer>
  );
};

const StyledDrawer = styled.div<{ $width?: number; $height?: number }>`
  position: relative;
  border-top: 1px solid #aaa;
  width: ${(props) => `${props.$width}px` || "100%"};
  height: ${(props) => `${props.$height}px` || "100%"};
`;

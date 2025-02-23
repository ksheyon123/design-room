import React, { RefObject, useEffect, useRef, useState } from "react";

import * as THREE from "three";

import { useCamera } from "@/hooks/useCamera";
import { useMesh } from "@/hooks/useMesh";
import { useRenederer } from "@/hooks/useRenderer";

import styled from "styled-components";
import { useLine } from "@/hooks/useLine";
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
  const rendererRef = useRef<THREE.WebGLRenderer>();

  const { createCamera } = useCamera();
  const { createRenderer } = useRenederer();
  const { createPlane } = useMesh(sceneRef.current, cameraRef.current);
  const {
    onPointMove,
    onPointKeydown,
    onPointKeyup,
    changeLineColor,
    onKeydownHandler,
    onKeyupHandler,
    chkLeftShift,
    // TEST
    drawGuidance,
    drawLine,
    getRef,
    getNearest,
  } = useLine(width, height, sceneRef.current, cameraRef.current);

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (canvasRef) {
      setIsMounted(true);
      const renderer = createRenderer(width, height);
      const scene = new THREE.Scene();
      const camera = createCamera(width, height);

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
    }
  }, [canvasRef]);

  useEffect(() => {
    if (isMounted) {
      const renderer = rendererRef.current;
      canvasRef.current && canvasRef.current.appendChild(renderer!.domElement);

      const plane = createPlane("floor", width, height, 0xffffff);
      sceneRef.current!.add(plane);

      let handleId: any;
      const animate = () => {
        if (sceneRef.current && cameraRef.current) {
          handleId = requestAnimationFrame(animate);

          cameraRef.current.position.set(0, 0, 50);
          cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));

          let { from, to, cursor } = getRef();
          // outliner(cursor);
          const newPointFrom = getNearest(from);
          const newPointTo = getNearest(to);
          const newPointCursor = getNearest(cursor);
          const { to: withStraightTo } = chkLeftShift(newPointFrom, newPointTo);
          const { to: withStraightCursor } = chkLeftShift(
            newPointFrom,
            newPointCursor
          );
          const guidanceLine = drawGuidance(newPointFrom, withStraightCursor);
          if (guidanceLine) {
            sceneRef.current.add(guidanceLine);
          }
          const realLine = drawLine(newPointFrom, withStraightTo);
          if (realLine) {
            sceneRef.current.add(realLine);
          }

          renderer!.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();
      return () => cancelAnimationFrame(handleId);
    }
  }, [isMounted]);

  useEffect(() => {
    if (
      isMounted &&
      canvasRef.current &&
      sceneRef.current &&
      cameraRef.current &&
      rendererRef.current
    ) {
      const renderer = rendererRef.current;
      canvasRef.current.addEventListener("mousedown", onPointKeydown);
      canvasRef.current.addEventListener("mousemove", (e) => {
        onPointMove(e);
        changeLineColor(e);
        renderer.render(sceneRef.current!, cameraRef.current!);
      });
      canvasRef.current.addEventListener("mouseup", onPointKeyup);
      window.addEventListener("keydown", onKeydownHandler);
      window.addEventListener("keyup", onKeyupHandler);
      return () => {
        canvasRef.current?.removeEventListener("mousedown", onPointKeydown);
        canvasRef.current?.removeEventListener("mousemove", (e) => {
          onPointMove(e);
          changeLineColor(e);
          renderer.render(sceneRef.current!, cameraRef.current!);
        });
        canvasRef.current?.removeEventListener("mouseup", onPointKeyup);
        window.addEventListener("keydown", onKeydownHandler);
        window.addEventListener("keyup", onKeyupHandler);
      };
    }
  }, [
    canvasRef.current,
    isMounted,
    sceneRef.current,
    cameraRef.current,
    rendererRef.current,
  ]);

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

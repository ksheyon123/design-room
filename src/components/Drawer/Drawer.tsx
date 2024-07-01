import React, { RefObject, useEffect, useRef, useState } from "react";

import * as THREE from "three";

import { useCamera } from "@/hooks/useCamera";
import { useMesh } from "@/hooks/useMesh";
import { useRenederer } from "@/hooks/useRenderer";

import * as styles from "./Drawer.module.css";
import styled from "styled-components";

interface IProps {
  onClick: Function;
  width?: number;
  height?: number;
}

export const Drawer: React.FC<IProps> = ({ width, height, onClick }) => {
  const canvasRef = useRef<HTMLDivElement>();
  const { createCamera, moveCamera } = useCamera();
  const { createRenderer } = useRenederer();
  const { createFloor } = useMesh();

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (canvasRef) {
      setIsMounted(true);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (isMounted) {
      const scene = new THREE.Scene();
      const camera = createCamera(width, height);
      const renderer = createRenderer(width, height);
      canvasRef.current && canvasRef.current.appendChild(renderer.domElement);

      const plane = createFloor(10, 10, 0xffffff);
      plane.name = "plane";
      scene.add(plane);

      const geometry = new THREE.PlaneGeometry(10, 10);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
      });
      const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
      outlineMesh.scale.multiplyScalar(1.05);
      outlineMesh.name = "outline";
      scene.add(outlineMesh);

      camera.position.set(0, 20, 10);

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
      return () => cancelAnimationFrame(handleId);
    }
  }, [isMounted]);

  return (
    <StyledDrawer $width={width} $height={height}>
      <div ref={canvasRef as RefObject<HTMLDivElement>} />
    </StyledDrawer>
  );
};

const StyledDrawer = styled.div<{ $width?: number; $height?: number }>`
  width: ${(props) => `${props.$width}px` || "100%"};
  height: ${(props) => `${props.$height}px` || "100%"};
`;

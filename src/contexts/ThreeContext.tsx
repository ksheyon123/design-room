import React, {
  ReactNode,
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";

import * as THREE from "three";
import { useCamera } from "@/hooks/useCamera";
import { useRenederer } from "@/hooks/useRenderer";

interface IProps {
  children: ReactNode;
}

type ThreeContext = {
  scene: THREE.Scene | undefined;
  camera: THREE.PerspectiveCamera | undefined;
  renderer: THREE.WebGLRenderer | undefined;
  meshes: THREE.Object3D | undefined;
};

export const ThreeContext = createContext<ThreeContext>({
  scene: undefined,
  camera: undefined,
  renderer: undefined,
  meshes: undefined,
});

export const ThreeProvider: React.FC<IProps> = ({ children }) => {
  const { createCamera } = useCamera();
  const { createRenderer } = useRenederer();

  const [scene, setScene] = useState<THREE.Scene>();
  const [camera, setCamera] = useState<THREE.PerspectiveCamera>();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();

  const [isThreeJsLoaded, setIsThreeJsLoaded] = useState<boolean>(false);

  const meshesRef = useRef<THREE.Object3D>();
  const { current } = meshesRef;

  const init = () => {
    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer();
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setIsThreeJsLoaded(true);
    console.log("THREE JS MOUNTED!");
  };
  useEffect(() => {
    if (WebGL.isWebGLAvailable()) {
      init();
    } else {
      alert("WebGL not supported");
    }
  }, []);

  return (
    <ThreeContext.Provider
      value={{
        scene,
        camera,
        renderer,
        meshes: current,
      }}
    >
      {isThreeJsLoaded && children}
    </ThreeContext.Provider>
  );
};

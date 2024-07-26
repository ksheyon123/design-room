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
  meshes: Meshes;
};

type Meshes = {
  lines: THREE.Object3D[];
  plane: THREE.Object3D | null;
  hexahedron: THREE.Object3D | null;
};

export const ThreeContext = createContext<ThreeContext>({
  scene: undefined,
  camera: undefined,
  renderer: undefined,
  meshes: {
    lines: [],
    plane: null,
    hexahedron: null,
  },
});

export const ThreeProvider: React.FC<IProps> = ({ children }) => {
  const { createCamera } = useCamera();
  const { createRenderer } = useRenederer();

  const [scene, setScene] = useState<THREE.Scene>();
  const [camera, setCamera] = useState<THREE.PerspectiveCamera>();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();

  const [isThreeJsLoaded, setIsThreeJsLoaded] = useState<boolean>(false);

  const meshesRef = useRef<Meshes>({
    lines: [],
    plane: null,
    hexahedron: null,
  });
  const { current } = meshesRef;

  const createScene = () => {
    const scene = new THREE.Scene();
    return scene;
  };

  const init = () => {
    const scene = createScene();
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

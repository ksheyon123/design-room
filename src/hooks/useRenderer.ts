import * as THREE from "three";

export const useRenederer = () => {
  /**
   * @description Renderer 객체를 생성합니다.
   * @param width 렌더링 영역의 폭
   * @param height 렌더링 영역의 높이
   * @param color (optional) default 0xFFFFFF 렌더링 영역의 색상을 지정합니다.
   * @returns ThreeJs Renderer 객체
   */
  const createRenderer = (width?: number, height?: number, color?: number) => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width || window.innerWidth, height || window.innerHeight);
    renderer.setClearColor(color || 0xffffff);
    return renderer;
  };
  return {
    createRenderer,
  };
};

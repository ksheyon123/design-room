import * as THREE from "three";

export const useMesh = () => {
  const createPlaidTexture = () => {
    const size = 600;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d")!;

    // Define colors for the plaid pattern
    const colors = ["#000000", "#FFFFFF"];

    // Draw vertical stripes
    for (let i = 0; i < size; i += 10) {
      context.fillStyle = colors[i % 2];
      context.fillRect(i, 0, 10, size);
    }

    // Draw horizontal stripes
    for (let i = 0; i < size; i += 10) {
      context.fillStyle = colors[i % 2];
      context.fillRect(0, i, size, 10);
    }

    return new THREE.CanvasTexture(canvas);
  };

  const createPlane = (
    name: string,
    width?: number,
    height?: number,
    color?: number
  ) => {
    // const d = createPlaidTexture();
    const geometry = new THREE.PlaneGeometry(width || 1, height || 1);
    const material = new THREE.MeshBasicMaterial({
      color: color || 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.name = name;
    return plane;
  };

  const createOutline = (name: string, width?: number, height?: number) => {
    const geometry = new THREE.PlaneGeometry(width || 1, height || 1);
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      side: THREE.BackSide,
    });
    const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
    outlineMesh.scale.multiplyScalar(1.01);
    outlineMesh.name = name;
    return outlineMesh;
  };

  const combineMesh = (scene: THREE.Scene) => {
    const vertices = scene.children.filter((el) => el.name === "line");
    // Create the plane geometry using the vertices
    const planeGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      vertices[0].position.x,
      vertices[0].position.y,
      vertices[0].position.z,
      vertices[1].position.x,
      vertices[1].position.y,
      vertices[1].position.z,
      vertices[2].position.x,
      vertices[2].position.y,
      vertices[2].position.z,
      vertices[0].position.x,
      vertices[0].position.y,
      vertices[0].position.z,
      vertices[2].position.x,
      vertices[2].position.y,
      vertices[2].position.z,
      vertices[3].position.x,
      vertices[3].position.y,
      vertices[3].position.z,
    ]);
    planeGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    planeGeometry.computeVertexNormals();

    // Create the plane mesh
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);
  };

  return {
    createPlane,
    createOutline,
    combineMesh,
  };
};

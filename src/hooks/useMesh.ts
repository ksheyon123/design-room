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

  const createDot = () => {
    const geometry = new THREE.CircleGeometry(0.1, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const circle = new THREE.Mesh(geometry, material);
    return circle;
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

  // Function to get the start and end points of a line
  const getVertices = (line) => {
    const positions = line.geometry.attributes.position.array;
    return [
      new THREE.Vector3(positions[0], positions[1], positions[2]),
      new THREE.Vector3(positions[3], positions[4], positions[5]),
    ];
  };

  const combineMesh = (scene: THREE.Scene) => {
    const lines = scene.children.filter((el) => el.name === "line");

    if (lines.length < 4) {
      console.error("Not enough lines to form a plane");
      return null;
    }

    // Retrieve vertices from the lines
    const vertices: THREE.Vector3[] = [];
    lines.forEach((line) => {
      const [start, end] = getVertices(line);
      vertices.push(start, end);
    });

    // Ensure we have unique vertices
    const uniqueVertices = Array.from(
      new Set(vertices.map((v) => `${v.x},${v.y},${0}`))
    ).map((v) => {
      const [x, y, z] = v.split(",").map(Number);
      return new THREE.Vector3(x, y, z);
    });

    console.log(
      uniqueVertices[0].x,
      uniqueVertices[0].y,
      0, // uniqueVertices[0].z
      uniqueVertices[1].x,
      uniqueVertices[1].y,
      0, // uniqueVertices[1].z,
      uniqueVertices[2].x,
      uniqueVertices[2].y,
      0, // uniqueVertices[2].z,

      uniqueVertices[2].x,
      uniqueVertices[2].y,
      0, // uniqueVertices[2].z,
      uniqueVertices[3].x,
      uniqueVertices[3].y,
      0, //uniqueVertices[3].z,
      uniqueVertices[0].x,
      uniqueVertices[0].y,
      0 //uniqueVertices[0].z,
    );
    if (uniqueVertices.length !== 4) {
      console.error("Vertices do not form a valid plane");
      return null;
    }

    // Create the plane geometry using the unique vertices
    const planeGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      uniqueVertices[0].x,
      uniqueVertices[0].y,
      0, // uniqueVertices[0].z

      uniqueVertices[1].x,
      uniqueVertices[1].y,
      0, // uniqueVertices[1].z,

      uniqueVertices[2].x,
      uniqueVertices[2].y,
      0, // uniqueVertices[2].z,

      uniqueVertices[2].x,
      uniqueVertices[2].y,
      0, // uniqueVertices[2].z,

      uniqueVertices[3].x,
      uniqueVertices[3].y,
      0, // uniqueVertices[3].z,

      uniqueVertices[0].x,
      uniqueVertices[0].y,
      0, // uniqueVertices[0].z,
    ]);
    planeGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    planeGeometry.computeVertexNormals();

    // Create the plane mesh
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    return plane;
  };

  const testMesh = () => {
    const geometry = new THREE.BufferGeometry();

    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    const vertices = new Float32Array([
      -1.0,
      -1.0,
      1.0, // v0
      1.0,
      -1.0,
      1.0, // v1
      1.0,
      1.0,
      1.0, // v2

      1.0,
      1.0,
      1.0, // v3
      -1.0,
      1.0,
      1.0, // v4
      -1.0,
      -1.0,
      1.0, // v5
    ]);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  return {
    createPlane,
    createOutline,
    createDot,
    combineMesh,
    testMesh,
    getVertices,
  };
};

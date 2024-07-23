import { useRef } from "react";
import * as THREE from "three";

export const useMesh = (
  scene?: THREE.Scene,
  camera?: THREE.PerspectiveCamera
) => {
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
  const getVerticesFromPlane = (geometry) => {
    const positionAttribute = geometry.getAttribute("position");
    const vertices: THREE.Vector3[] = [];

    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positionAttribute, i);
      vertices.push(vertex);
    }

    return vertices;
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

    // if (lines.length < 4) {
    //   console.error("Not enough lines to form a plane");
    //   return null;
    // }

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
    plane.name = "plane";
    return plane;
  };

  const mouseCoordRef = useRef<THREE.Vector3 | null>();
  const isClickedRef = useRef<boolean>(false);
  const deltaRef = useRef<number>(0);

  const onMouseKeydown = (event: MouseEvent) => {
    // Get mouse coordinate
    let x = (event.offsetX / window.innerWidth) * 2 - 1;
    let y = -(event.offsetY / window.innerHeight) * 2 + 1;
    mouseCoordRef.current = new THREE.Vector3(x, y, 0);
    isClickedRef.current = true;
  };

  const onMouseKeyup = () => {
    // Get mouse coordinate
    isClickedRef.current = false;
  };

  const onMouseMove = () => {
    let prev = 0;
    let timerId: any;
    const getDelta = (event: MouseEvent) => {
      clearTimeout(timerId);
      deltaRef.current = prev - event?.pageY;
      prev = event?.pageY;
      timerId = setTimeout(() => {
        deltaRef.current = 0;
      }, 100);
    };

    return getDelta;
  };

  const getCoord = () => {
    return mouseCoordRef.current;
  };

  const addHeight = () => {
    const plane = scene!.children.filter(
      (el) => el.name === "plane"
    )[0] as THREE.Mesh<
      THREE.PlaneGeometry,
      THREE.MeshBasicMaterial,
      THREE.Object3DEventMap
    >;
    if (plane) {
      plane.removeFromParent();
      let height = deltaRef.current;
      const vertices = getVerticesFromPlane(plane.geometry);

      console.log("vertices", vertices);
      // Define the positions for the new geometry with height
      const baseVertices = vertices.map((v) => [v.x, v.y, v.z]).flat();
      const topVertices = vertices.map((v) => [v.x, v.y, v.z + height]).flat();

      const positionsWithHeight = new Float32Array([
        ...baseVertices,
        ...topVertices,
        ...baseVertices.slice(0, 3),
        ...topVertices.slice(0, 3),
        ...baseVertices.slice(3, 6),
        ...topVertices.slice(3, 6),
        ...baseVertices.slice(6, 9),
        ...topVertices.slice(6, 9),
        ...baseVertices.slice(9, 12),
        ...topVertices.slice(9, 12),
      ]);

      // Define the indices for the faces
      const indices = [
        // Bottom face
        0, 1, 2, 2, 3, 0,
        // Top face
        4, 5, 6, 6, 7, 4,
        // Side faces
        0, 1, 5, 5, 4, 0, 1, 2, 6, 6, 5, 1, 2, 3, 7, 7, 6, 2, 3, 0, 4, 4, 7, 3,
      ];

      const geometryWithHeight = new THREE.BufferGeometry();
      geometryWithHeight.setAttribute(
        "position",
        new THREE.BufferAttribute(positionsWithHeight, 3)
      );
      geometryWithHeight.setIndex(indices);
      geometryWithHeight.computeVertexNormals();

      const materialWithHeight = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
      });

      const meshWithHeight = new THREE.Mesh(
        geometryWithHeight,
        materialWithHeight
      );
      meshWithHeight.name = "plane";
      scene!.add(meshWithHeight);
    }
  };

  return {
    onMouseKeydown,
    onMouseKeyup,
    onMouseMove,

    createPlane,
    createOutline,
    createDot,

    getCoord,
    combineMesh,
    addHeight,
    getVertices,
  };
};

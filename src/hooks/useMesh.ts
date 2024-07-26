import { ThreeContext } from "@/contexts/ThreeContext";
import { useContext, useRef } from "react";
import * as THREE from "three";

export const useMesh = (
  scene?: THREE.Scene,
  camera?: THREE.PerspectiveCamera
) => {
  let { meshes } = useContext(ThreeContext);
  const guideMeshRef =
    useRef<
      THREE.Mesh<
        THREE.BufferGeometry<THREE.NormalBufferAttributes>,
        THREE.MeshBasicMaterial,
        THREE.Object3DEventMap
      >
    >();
  const mouseCoordRef = useRef<THREE.Vector3 | null>();
  const isClickedRef = useRef<boolean>(false);
  const deltaRef = useRef<number>(0);
  const deltaSumRef = useRef<number>(0);
  const isMetaLeftRef = useRef<boolean>(false);

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

  const combineMesh = () => {
    const { lines } = meshes;
    console.log(lines);
    // const lines = scene.children.filter((el) => el.name === "line");

    if (!lines) {
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

    meshes.plane = plane;
    meshes.lines = [];
    return plane;
  };

  const onKeyboardKeydown = (e: KeyboardEvent) => {
    const { code } = e;
    switch (code) {
      case "MetaLeft":
        isMetaLeftRef.current = true;
        break;
    }
  };

  const onKeyboardKeyup = (e: KeyboardEvent) => {
    const { code } = e;
    switch (code) {
      case "MetaLeft":
        isMetaLeftRef.current = false;
        break;
    }
  };

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
    mouseCoordRef.current = null;
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
    return {
      isMetaLeft: isMetaLeftRef.current,
    };
  };

  const addHeight = () => {
    const { plane } = meshes;
    if (isClickedRef.current && isMetaLeftRef.current && plane) {
      deltaSumRef.current += deltaRef.current;
      const obj = plane;
      let height = deltaSumRef.current;
      const vertices = getVerticesFromPlane((obj as any).geometry);

      // Define the positions for the new geometry with height
      const bottomVertices = [
        vertices[0],
        vertices[1],
        vertices[2],
        vertices[4],
      ];
      const topVertices = bottomVertices
        .map((v) => new THREE.Vector3(v.x, v.y, height))
        .flat();

      const hexahedronVertices = bottomVertices.concat(topVertices);
      const positions = new Float32Array(8 * 3);
      hexahedronVertices.forEach((vertex, i) => {
        positions[i * 3] = vertex.x;
        positions[i * 3 + 1] = vertex.y;
        positions[i * 3 + 2] = vertex.z;
      });

      // Define the faces using the indices of the vertices
      const indices = [
        // Bottom face
        0, 1, 2, 0, 2, 3,
        // Top face
        4, 5, 6, 4, 6, 7,
        // Sides
        0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7,
      ];

      // Create the geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setIndex(indices);

      // Create a material
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
      });
      if (guideMeshRef.current) {
        guideMeshRef.current.removeFromParent();
      }
      // Create the mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = "tempHexahedron";
      guideMeshRef.current = mesh;
      return mesh;
    }
  };

  const outliner = (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    if (mouseCoordRef.current) {
      const v = new THREE.Vector2(
        mouseCoordRef.current?.x,
        mouseCoordRef.current?.y
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(v, camera);
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      for (let i = 0; i < intersects.length; i++) {
        const { point, object } = intersects[i];
        (
          object as THREE.Mesh<
            THREE.BufferGeometry<THREE.NormalBufferAttributes>,
            THREE.MeshBasicMaterial,
            THREE.Object3DEventMap
          >
        ).material.color.set(0x000000);
        // return { point, object };
      }
    }
  };

  const setCreatedObj = () => {
    if (guideMeshRef.current) {
      guideMeshRef.current?.material.color.set(0x000000);
      const { plane } = meshes;
      plane?.removeFromParent();
      meshes.plane = null;
      meshes.hexahedron.push(guideMeshRef.current);
    }
  };

  return {
    onMouseKeydown,
    onMouseKeyup,
    onMouseMove,
    onKeyboardKeydown,
    onKeyboardKeyup,

    createPlane,
    createOutline,
    createDot,

    getCoord,
    combineMesh,
    addHeight,
    getVertices,
    outliner,
    setCreatedObj,
  };
};

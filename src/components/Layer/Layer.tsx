import React, { RefObject, useRef } from "react";

export const Layer: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>();

  return <div ref={canvasRef as RefObject<HTMLDivElement>} />;
};

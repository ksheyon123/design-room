"use client";

import React from "react";

import { ThreeProvider } from "@/contexts/ThreeContext";
import { IProps } from "@/types/common.type";
import { ModalProvider } from "./ModalContext";

export const Providers: React.FC<IProps> = ({ children }) => {
  return (
    <ThreeProvider>
      <ModalProvider>{children}</ModalProvider>
    </ThreeProvider>
  );
};

"use client";

import React from "react";

import { ThreeProvider } from "@/contexts/ThreeContext";
import { IProps } from "@/types/common.type";
import { ModalProvider } from "./ModalContext";
import { ThemeProvider } from "styled-components";

export const Providers: React.FC<IProps> = ({ children }) => {
  return (
    <ThemeProvider theme={{}}>
      <ThreeProvider>
        <ModalProvider>{children}</ModalProvider>
      </ThreeProvider>
    </ThemeProvider>
  );
};

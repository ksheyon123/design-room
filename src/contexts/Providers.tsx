"use client";

import React, { ReactNode } from "react";

import { ThreeProvider } from "@/contexts/ThreeContext";
import { IProps } from "@/types/common.type";

export const Providers: React.FC<IProps> = ({ children }) => {
  return <ThreeProvider>{children}</ThreeProvider>;
};

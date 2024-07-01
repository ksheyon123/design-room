"use client";

import React, { useContext } from "react";
import { ThreeView } from "@/components/ThreeView/ThreeView";
import { ModalContext } from "@/contexts/ModalContext";
import { Drawer } from "@/components/Drawer/Drawer";
import { title } from "process";

export default function Page() {
  const { toggleModal } = useContext(ModalContext);

  return (
    <div>
      <div
        onClick={() => {
          if (toggleModal) {
            toggleModal({
              title: <div>close</div>,
              content: <Drawer width={600} height={600} onClick={() => {}} />,
            });
          }
        }}
      >
        Button
      </div>
      {/* <ThreeView />; */}
    </div>
  );
}

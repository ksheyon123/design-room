"use client";

import React, { useContext } from "react";
import { ModalContext } from "@/contexts/ModalContext";
import { Drawer } from "@/components/Drawer/Drawer";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

export default function Page() {
  const { toggleModal } = useContext(ModalContext);

  return (
    <div>
      <div
        onClick={() => {
          if (toggleModal) {
            toggleModal({
              title: (
                <div
                  className="flex space-between"
                  onClick={() => toggleModal()}
                >
                  <span>Drawer</span>
                  <FontAwesomeIcon icon={faClose} />
                </div>
              ),
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

import React, { useContext, useState } from "react";
import * as THREE from "three";

import * as styles from "./ToolBox.module.css";
import { useMesh } from "@/hooks/useMesh";
import { ThreeContext } from "@/contexts/ThreeContext";
import { useModal } from "@/hooks/useModal";
import { ModalContext } from "@/contexts/ModalContext";
import { useLine } from "@/hooks/useLine";

interface IProps {
  scene: THREE.Scene;
}

type ToolItem = {
  label: string;
  isClicked?: boolean;
  onClick?: Function;
  remove?: Function;
};

export const ToolBox = ({ scene }: IProps) => {
  const { scene: rootScene } = useContext(ThreeContext);
  const { combineMesh, addHeight } = useMesh();
  const { toggleModal } = useContext(ModalContext);
  const { remover } = useLine();

  const TOOL_ITEMS: ToolItem[] = [
    {
      label: "Line",
    },
    {
      label: "Square",
    },
    {
      label: "Combine",
      onClick: combineMesh,
    },
    {
      label: "remove",
      remove: remover,
    },
  ];

  const [items, setItems] = useState<ToolItem[]>(TOOL_ITEMS);

  return (
    <div className={styles["toolbox-container"]}>
      <ul>
        {items.map(({ label, isClicked, onClick, remove }, idx) => (
          <li
            className={`${isClicked ? styles["active"] : ""}`}
            onClick={() => {
              if (onClick) {
                const plane = onClick();
                rootScene?.add(plane);
                if (toggleModal) {
                  toggleModal();
                }
              } else if (remove) {
                remove();
              } else {
                setItems((prev: ToolItem[]) => {
                  const newItems = {
                    ...prev[idx],
                    isClicked: !prev[idx]?.isClicked,
                  };
                  return prev
                    .slice(0, idx)
                    .concat(newItems)
                    .concat(prev.slice(idx + 1));
                });
              }
            }}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

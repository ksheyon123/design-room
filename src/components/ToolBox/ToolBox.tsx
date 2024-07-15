import React, { useState } from "react";

import * as styles from "./ToolBox.module.css";

type ToolItem = {
  label: string;
  isClicked?: boolean;
};

const TOOL_ITEMS: ToolItem[] = [
  {
    label: "Line",
  },
  {
    label: "Square",
  },
];

export const ToolBox: React.FC = () => {
  const [items, setItems] = useState<ToolItem[]>(TOOL_ITEMS);

  return (
    <div className={styles["toolbox-container"]}>
      <ul>
        {items.map(({ label, isClicked }, idx) => (
          <li
            className={`${isClicked ? styles["active"] : ""}`}
            onClick={() =>
              setItems((prev: ToolItem[]) => {
                const newItems = {
                  ...prev[idx],
                  isClicked: !prev[idx]?.isClicked,
                };
                return prev
                  .slice(0, idx)
                  .concat(newItems)
                  .concat(prev.slice(idx + 1));
              })
            }
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

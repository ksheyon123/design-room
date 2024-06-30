import React, { ReactNode } from "react";
import * as styles from "./Modal.module.css";

interface IProps {
  title?: ReactNode;
  content?: ReactNode;
  buttons: ReactNode[];
}

const Modal: React.FC<IProps> = ({ title, content, buttons }) => {
  return (
    <div>
      <div>
        {!!title && <div>{title}</div>}
        {!!content && <div>{content}</div>}
        <div>
          {buttons.map((el: any) => {
            const { onClick, name } = el;
            return (
              <button onClick={() => onClick()} {...el}>
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Modal;

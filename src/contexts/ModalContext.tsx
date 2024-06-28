import React, { ReactNode, createContext } from "react";
import Modal from "@/components/Modal/Modal";
import { useModal } from "@/hooks/useModal";
import { IProps } from "@/types/common.type";

export const ModalContext = createContext<{
  toggleModal: Function | undefined;
}>({
  toggleModal: undefined,
});

export const ModalProvider: React.FC<IProps> = ({ children }) => {
  const { component, isOpened, toggleModal } = useModal();
  const isComponent = !!component;
  return (
    <ModalContext.Provider
      value={{
        toggleModal,
      }}
    >
      {children}
      {isOpened && isComponent && <Modal {...component} />}
    </ModalContext.Provider>
  );
};

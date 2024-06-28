import { ReactNode, useState } from "react";

export const useModal = () => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [component, setComponent] = useState<{
    buttons: ReactNode[];
    title: ReactNode;
    content: ReactNode;
  }>();

  const toggleModal = (props?: any) => {
    if (!props) {
      setIsOpened(false);
    } else {
      const { buttons, title, content } = props;
      setComponent({ buttons, title, content });
      setIsOpened(true);
    }
  };

  return {
    toggleModal,
    isOpened,
    component,
  };
};

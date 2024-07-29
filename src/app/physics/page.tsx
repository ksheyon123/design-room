"use client";

import { NavigationView } from "@/components/NavigationView/NavigationView";
import styled from "styled-components";

const Physics = () => {
  return (
    <StyledMain>
      <NavigationView />
    </StyledMain>
  );
};

const StyledMain = styled.main`
  width: 100vw;
  height: 100vw;
`;

export default Physics;

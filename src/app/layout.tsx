import React from "react";

import { Providers } from "@/contexts/Providers";
import { IProps } from "@/types/common.type";

const RootLayout: React.FC<IProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;

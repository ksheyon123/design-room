import React from "react";
import { Providers } from "@/contexts/Providers";
import { IProps } from "@/types/common.type";
import "@/styles/global.css";

const RootLayout: React.FC<IProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <script src="https://kit.fontawesome.com/3062cd7a80.js" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;

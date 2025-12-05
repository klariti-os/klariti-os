import React from "react";
import Navigation from "./Navigation";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative flex flex-col min-h-screen">
      {children}
      <Navigation />
    </div>
  );
};

export default BaseLayout;

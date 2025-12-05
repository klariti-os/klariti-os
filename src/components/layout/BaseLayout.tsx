import React from "react";
import Navigation from "./Navigation";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative flex flex-col justify-center min-h-screen pt-20">
      <div
        className="absolute inset-0 bg-no-repeat bg-center opacity-60 bg-fixed"
        style={{
          backgroundImage: `url(/images/pc-land2.png)`,
          backgroundSize: "2000px 2000px",
          backgroundPosition: "center",
          zIndex: -1,
        
        }}
      ></div>
      
      {children}
      <Navigation />
    </div>
  );
};

export default BaseLayout;

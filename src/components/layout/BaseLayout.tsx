"use client";

import React from "react";
import Navigation from "./Navigation";
import { usePathname } from "next/navigation";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div
      className={`relative flex flex-col min-h-screen ${
        !isHomePage ? "pb-20 md:pt-20 md:pb-0" : ""
      }`}
    >
      {children}
      <Navigation />
    </div>
  );
};

export default BaseLayout;

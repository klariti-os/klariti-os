"use client";

import React from "react";
import Navigation from "./Navigation";
import { usePathname } from "next/navigation";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const hasFullBleedHero = pathname === "/" || pathname === "/manifesto";

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navigation /> 
      <main id="main-content" className={`flex-1 ${!hasFullBleedHero ? "pt-16" : ""}`}>
        {children}
      </main>
    </div>
  ); 
};

export default BaseLayout;

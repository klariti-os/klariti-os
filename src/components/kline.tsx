import React from "react";

const Kline: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <span
      className={`border-b border-foreground/30 font-editorial font-normal ${className || ""}`}
    >
      {children}
    </span>
  );
};

export default Kline;

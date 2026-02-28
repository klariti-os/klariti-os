import React from "react";

interface KlaritiLogoProps {
  variant?: "dark" | "white";
  className?: string;
}

const KlaritiLogo: React.FC<KlaritiLogoProps> = ({
  variant = "dark",
  className = "size-7",
}) => {
  const strokeColor = variant === "white" ? "#ffffff" : "#000000";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke={strokeColor}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <g transform="translate(50,50)">
        <path d="M0,-12 C8,-22 8,-38 0,-45 C-8,-38 -8,-22 0,-12 Z" transform="rotate(0)" />
        <path d="M0,-12 C8,-22 8,-38 0,-45 C-8,-38 -8,-22 0,-12 Z" transform="rotate(45)" />
        <path d="M0,-12 C8,-22 8,-38 0,-45 C-8,-38 -8,-22 0,-12 Z" transform="rotate(90)" />
        <path d="M0,-12 C8,-22 8,-38 0,-45 C-8,-38 -8,-22 0,-12 Z" transform="rotate(135)" />
        <path d="M0,-12 C8,-22 8,-38 0,-45 C-8,-38 -8,-22 0,-12 Z" transform="rotate(180)" />
        <path d="M0,-12 C8,-22 8,-38 0,-45 C-8,-38 -8,-22 0,-12 Z" transform="rotate(225)" />
        <path d="M0,-12 C8,-22 8,-38 0,-45 C-8,-38 -8,-22 0,-12 Z" transform="rotate(270)" />
        <path d="M0,-12 C8,-22 8,-38 0,-45 C-8,-38 -8,-22 0,-12 Z" transform="rotate(315)" />
      </g>
    </svg>
  );
};

export default KlaritiLogo;

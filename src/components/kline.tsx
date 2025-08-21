import React from "react";

const Kline: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <span
            className={`border-b-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-pink-700 to-purple-900 ${className}`}
        >
            {children} 
        </span>
    );
};

export default Kline;
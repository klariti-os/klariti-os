"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: number;
  username: string;
  email?: string;
}

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
}

export default function UserAvatar({ 
  user, 
  size = "md"
}: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user: currentUser } = useAuth();

  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    // Generate a consistent color based on username
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    
    const hash = username.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Check if this user is the current logged-in user
  const isCurrentUser = currentUser?.id === user.id;

  return (
    <div 
      className="relative inline-block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`${sizeClasses[size]} ${getAvatarColor(user.username)} rounded-full border-2 border-white/20 flex items-center justify-center font-bold text-white cursor-pointer group-hover:border-white/40 transition-all duration-200 shadow-md`}
        title={user.username}
      >
        {getInitials(user.username)}
      </div>

      {/* Hover Card */}
      {isHovered && (
        <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-[#27272A] border border-white/10 rounded-lg shadow-2xl overflow-hidden pointer-events-none">
          {/* User Info */}
          <div className="p-4 flex items-center gap-3">
            <div className={`h-16 w-16 ${getAvatarColor(user.username)} rounded-full flex items-center justify-center font-bold text-2xl text-white border-2 border-white/20 shadow-lg flex-shrink-0`}>
              {getInitials(user.username)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base truncate">
                {user.username} {isCurrentUser ? "(You)" : ""}
              </h3>
          
              {/* <p className="text-white/50 text-xs mt-1">
                Joined {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </p> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  variant?: "circle" | "rectangle";
  showHover?: boolean;
}

export default function UserAvatar({
  user,
  size = "md",
  variant = "circle",
  showHover = true,
}: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user: currentUser } = useAuth();

  const circleSizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  const rectangleSizeClasses = {
    sm: "h-8 px-3 text-xs gap-2",
    md: "h-10 px-4 text-sm gap-2.5",
    lg: "h-12 px-5 text-base gap-3",
  };

  const avatarSizeClasses = {
    sm: "h-5 w-5 text-[10px]",
    md: "h-6 w-6 text-xs",
    lg: "h-8 w-8 text-sm",
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  // Generate a muted, theme-consistent color based on username
  const getAvatarStyle = (username: string) => {
    // Use warm, muted earth tones that work with the design system
    const hueOffsets = [0, 30, 60, 90, 120, 180, 210, 270];
    const hash = username.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue = hueOffsets[Math.abs(hash) % hueOffsets.length];

    return {
      backgroundColor: `hsl(${hue}, 25%, 45%)`,
    };
  };

  // Check if this user is the current logged-in user
  const isCurrentUser = currentUser?.id === String(user.id);

  if (variant === "rectangle") {
    return (
      <div
        className="relative inline-block group"
        onMouseEnter={() => (showHover ? setIsHovered(true) : null)}
        onMouseLeave={() => (showHover ? setIsHovered(false) : null)}
      >
        <div
          className={`flex items-center ${rectangleSizeClasses[size]} bg-muted border border-border rounded-lg hover:border-muted-foreground transition-all duration-200 cursor-pointer`}
        >
          <div
            className={`${avatarSizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white border border-background/20 flex-shrink-0`}
            style={getAvatarStyle(user.username)}
          >
            {getInitials(user.username)}
          </div>
          <span className="text-foreground font-medium truncate">
            {user.username}
          </span>
          {isCurrentUser && (
            <span className="ml-auto px-1.5 py-0.5 text-[9px] font-medium bg-accent text-accent-foreground rounded-full border border-border font-mono">
              YOU
            </span>
          )}
        </div>

        {/* Hover Card */}
        {showHover && isHovered && (
          <div className="absolute z-50 top-full mt-2 left-0 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden pointer-events-none">
            <div className="p-4 flex items-center gap-3">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center font-bold text-xl text-white border-2 border-background/20 shadow-sm flex-shrink-0"
                style={getAvatarStyle(user.username)}
              >
                {getInitials(user.username)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-foreground font-medium text-sm truncate">
                  {user.username} {isCurrentUser ? "(You)" : ""}
                </h3>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Circle variant (default)
  return (
    <div
      className="relative inline-block group"
      onMouseEnter={() => (showHover ? setIsHovered(true) : null)}
      onMouseLeave={() => (showHover ? setIsHovered(false) : null)}
    >
      <div
        className={`${circleSizeClasses[size]} rounded-full border-2 border-card flex items-center justify-center font-bold text-white cursor-pointer group-hover:border-muted transition-all duration-200 shadow-sm`}
        style={getAvatarStyle(user.username)}
        title={user.username}
      >
        {getInitials(user.username)}
      </div>

      {/* Hover Card */}
      {showHover && isHovered && (
        <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden pointer-events-none">
          <div className="p-4 flex items-center gap-3">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center font-bold text-xl text-white border-2 border-background/20 shadow-sm flex-shrink-0"
              style={getAvatarStyle(user.username)}
            >
              {getInitials(user.username)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground font-medium text-sm truncate">
                {user.username} {isCurrentUser ? "(You)" : ""}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

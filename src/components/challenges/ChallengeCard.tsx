"use client";

import React, { useState, useEffect } from "react";
import { Challenge, ChallengeType } from "@/services/challenges";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "./UserAvatar";

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (id: number) => void;
  onToggle?: (id: number) => void;
  onClick?: (challenge: Challenge) => void;
  showActions?: boolean;
  variant?: "default" | "compact";
  className?: string;
  style?: React.CSSProperties;
}

export default function ChallengeCard({
  challenge,
  onJoin,
  onToggle,
  onClick,
  showActions = true,
  variant = "default",
  className = "",
  style,
}: ChallengeCardProps) {
  const { user } = useAuth();
  const isCreator = user?.id === challenge.creator_id;
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Debug: Check participants data
  React.useEffect(() => {
    if (challenge.participants) {
      console.log(`Challenge "${challenge.name}" participants:`, challenge.participants);
    } else {
      console.log(`Challenge "${challenge.name}" has no participants`);
    }
  }, [challenge.name, challenge.participants]);

  // Calculate time remaining for time-based challenges
  useEffect(() => {
    if (challenge.challenge_type === ChallengeType.TIME_BASED && challenge.time_based_details) {
      const updateTimeRemaining = () => {
        const now = new Date();
        const startString = challenge.time_based_details!.start_date;
        const endString = challenge.time_based_details!.end_date;
        const start = new Date(startString.endsWith("Z") ? startString : `${startString}Z`);
        const end = new Date(endString.endsWith("Z") ? endString : `${endString}Z`);

        // Check if challenge hasn't started yet
        if (now < start) {
          const diff = start.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          if (days > 0) {
            setTimeRemaining(`Starts in ${days}d ${hours}h`);
          } else if (hours > 0) {
            setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
          } else if (minutes > 0) {
            setTimeRemaining(`Starts in ${minutes}m ${seconds}s`);
          } else {
            setTimeRemaining(`Starts in ${seconds}s`);
          }
          return;
        }

        // Challenge is active - show time until end
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining("Ended");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${seconds}s`);
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [challenge.challenge_type, challenge.time_based_details]);

  const formatDate = (dateString: string) => {
    // Ensure the date string is treated as UTC if it doesn't have timezone info
    const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
    const date = new Date(utcString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };


  return (
    <div 
      style={style}
      onClick={() => onClick && onClick(challenge)}
      className={`group relative flex flex-col p-5 bg-[#18181B]/60 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-white/10 hover:bg-[#18181B]/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Header: Title & Status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        
            {isCreator && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 font-mono">
                YOU
              </span>
            )}
            
            {/* Participant Avatars */}
            {challenge.participants && challenge.participants.length > 0 && (
              <div className="flex -space-x-2 ml-1" onClick={(e) => e.stopPropagation()}>
                {challenge.participants.slice(0, 4).map((participant) => (
                  <UserAvatar
                    key={participant.id}
                    user={participant}
                    size="sm"
                  />
                ))}
                {challenge.participants.length > 4 && (
                  <div className="h-6 w-6 rounded-full bg-[#27272A] border-2 border-white/20 flex items-center justify-center text-[9px] font-bold text-gray-400 font-mono">
                    +{challenge.participants.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
          <h3 className="font-bold text-lg text-white truncate tracking-tight group-hover:text-green-400 transition-colors">
            {challenge.name}
          </h3>
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Time Remaining for Time-Based Challenges */}
            {challenge.challenge_type === ChallengeType.TIME_BASED && timeRemaining && (
              <div className="px-3 py-1.5 bg-[#27272A]/80 border border-white/10 rounded-lg">
                <span className="text-xs font-bold text-white font-mono">{timeRemaining}</span>
              </div>
            )}
            
            {/* Toggle Switch */}
            {challenge.challenge_type === ChallengeType.TOGGLE && onToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(challenge.id);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-[#18181B] ${
                  challenge.toggle_details?.is_active
                    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                    : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    challenge.toggle_details?.is_active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            )}
            
            {/* Join Button */}
            {onJoin && !isCreator && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(challenge.id);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 font-mono uppercase tracking-wide"
              >
                Join
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {challenge.description && (
        <p className="text-sm text-zinc-400 line-clamp-2 mb-4 font-sans leading-relaxed">
          {challenge.description}
        </p>
      )}

      {/* Footer: Metadata */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3 flex-wrap">
        {/* Type Badge */}
        <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
          {challenge.challenge_type === ChallengeType.TIME_BASED ? "Time Based" : "Toggle"}
        </span>

        {/* Strict Mode */}
        {challenge.strict_mode && (
          <span className="flex items-center gap-1.5 text-xs text-orange-400/80 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Strict
          </span>
        )}

        {/* Website Count */}
        {challenge.distractions && challenge.distractions.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono ml-auto">
            {challenge.distractions.length} sites
          </span>
        )}
      </div>
    </div>
  );
}

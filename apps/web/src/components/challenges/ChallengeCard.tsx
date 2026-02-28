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
  const isCreator = user?.id === String(challenge.creator_id);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (
      challenge.challenge_type === ChallengeType.TIME_BASED &&
      challenge.time_based_details
    ) {
      const updateTimeRemaining = () => {
        const now = new Date();
        const startString = challenge.time_based_details!.start_date;
        const endString = challenge.time_based_details!.end_date;
        const start = new Date(
          startString.endsWith("Z") ? startString : `${startString}Z`,
        );
        const end = new Date(
          endString.endsWith("Z") ? endString : `${endString}Z`,
        );
        if (now < start) {
          const diff = start.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          if (days > 0) setTimeRemaining(`Starts in ${days}d ${hours}h`);
          else if (hours > 0)
            setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
          else if (minutes > 0)
            setTimeRemaining(`Starts in ${minutes}m ${seconds}s`);
          else setTimeRemaining(`Starts in ${seconds}s`);
          return;
        }
        const diff = end.getTime() - now.getTime();
        if (diff <= 0) {
          setTimeRemaining("Ended");
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        if (days > 0) setTimeRemaining(`${days}d ${hours}h`);
        else if (hours > 0) setTimeRemaining(`${hours}h ${minutes}m`);
        else if (minutes > 0) setTimeRemaining(`${minutes}m ${seconds}s`);
        else setTimeRemaining(`${seconds}s`);
      };
      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [challenge.challenge_type, challenge.time_based_details]);

  const isToggleActive = challenge.toggle_details?.is_active;

  return (
    <div
      style={style}
      onClick={() => onClick && onClick(challenge)}
      className={`group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-foreground/30 hover:bg-muted/40 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Header: Title & Status */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isCreator && (
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-accent text-accent-foreground border border-border">
                YOU
              </span>
            )}
            {challenge.participants && challenge.participants.length > 0 && (
              <div className="flex -space-x-2 ml-1">
                {challenge.participants.slice(0, 4).map((participant) => (
                  <UserAvatar
                    key={participant.id}
                    user={participant}
                    size="sm"
                  />
                ))}
                {challenge.participants.length > 4 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground font-mono">
                    +{challenge.participants.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
          <h3
            className="font-serif text-lg font-normal text-foreground truncate tracking-tight group-hover:text-primary transition-colors"
            style={{ textWrap: "balance" }}
          >
            {challenge.name}
          </h3>
        </div>
        {showActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {challenge.challenge_type === ChallengeType.TIME_BASED &&
              timeRemaining && (
                <div className="px-3 py-1.5 bg-muted border border-border rounded-full">
                  <span className="text-xs font-mono text-muted-foreground">
                    {timeRemaining}
                  </span>
                </div>
              )}
            {challenge.challenge_type === ChallengeType.TOGGLE && onToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(challenge.id);
                }}
                className={`focus-ring relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 border-2
                  ${
                    isToggleActive
                      ? "bg-success border-success"
                      : "bg-muted border-border hover:border-muted-foreground"
                  }
                `}
                aria-label={
                  isToggleActive ? "Pause challenge" : "Start challenge"
                }
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full shadow-sm transition-all duration-300
                    ${
                      isToggleActive
                        ? "translate-x-[22px] bg-background"
                        : "translate-x-[3px] bg-muted-foreground border border-border"
                    }
                  `}
                />
              </button>
            )}
            {onJoin && !isCreator && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(challenge.id);
                }}
                className="focus-ring px-4 py-1.5 text-xs font-mono rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80"
              >
                Join
              </button>
            )}
          </div>
        )}
      </div>
      {challenge.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-sans leading-relaxed">
          {challenge.description}
        </p>
      )}
      <div className="mt-auto pt-4 border-t border-border flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
          {challenge.challenge_type === ChallengeType.TIME_BASED
            ? "Time Based"
            : "Toggle"}
        </span>
        {challenge.strict_mode && (
          <span className="flex items-center gap-1.5 text-xs text-destructive font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
            Strict
          </span>
        )}
        {challenge.distractions && challenge.distractions.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono ml-auto">
            {challenge.distractions.length} sites
          </span>
        )}
      </div>
    </div>
  );
}

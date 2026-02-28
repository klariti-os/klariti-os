"use client";

import React, { useEffect, useRef } from "react";
import { Challenge, ChallengeType } from "@/services/challenges";
import UserAvatar from "./UserAvatar";

interface ChallengeDetailModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChallengeDetailModal({
  challenge,
  isOpen,
  onClose,
}: ChallengeDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen || !challenge) return null;

  const formatDate = (dateString: string) => {
    const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
    const date = new Date(utcString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-fade-in"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-start">
          <div>
            <h2 className="text-xl font-serif font-normal text-foreground tracking-tight">
              {challenge.name}
            </h2>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span
                className={`px-2.5 py-1 text-[10px] font-mono rounded-full border ${
                  challenge.completed
                    ? "bg-accent text-accent-foreground border-border"
                    : "bg-primary/10 text-foreground border-primary/20"
                }`}
              >
                {challenge.completed ? "Completed" : "Active"}
              </span>
              <span className="px-2.5 py-1 text-[10px] font-mono bg-muted text-muted-foreground rounded-full border border-border">
                {challenge.challenge_type === ChallengeType.TIME_BASED
                  ? "Time Based"
                  : "Toggle"}
              </span>
              {challenge.strict_mode && (
                <span className="px-2.5 py-1 text-[10px] font-mono bg-destructive/10 text-destructive rounded-full border border-destructive/20">
                  Strict Mode
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="focus-ring p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          {challenge.description && (
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {challenge.description}
              </p>
            </div>
          )}

          {/* Time Details */}
          {challenge.challenge_type === ChallengeType.TIME_BASED &&
            challenge.time_based_details && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <h3 className="text-[10px] font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Start Date
                  </h3>
                  <p className="text-sm text-foreground font-mono">
                    {formatDate(challenge.time_based_details.start_date)}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <h3 className="text-[10px] font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
                    End Date
                  </h3>
                  <p className="text-sm text-foreground font-mono">
                    {formatDate(challenge.time_based_details.end_date)}
                  </p>
                </div>
              </div>
            )}

          {/* Toggle Details */}
          {challenge.challenge_type === ChallengeType.TOGGLE &&
            challenge.toggle_details && (
              <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-mono text-foreground">
                    Current Status
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    This challenge is currently{" "}
                    {challenge.toggle_details.is_active ? "active" : "inactive"}
                    .
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    challenge.toggle_details.is_active
                      ? "bg-success shadow-[0_0_8px_var(--success)]"
                      : "bg-muted-foreground/50"
                  }`}
                />
              </div>
            )}

          {/* Participants */}
          {challenge.participants && challenge.participants.length > 0 && (
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-wider">
                Participants ({challenge.participants.length})
              </h3>
              <div className="flex flex-col gap-2">
                {challenge.participants.map((participant) => (
                  <UserAvatar
                    key={participant.id}
                    user={participant}
                    size="md"
                    variant="rectangle"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Blocked Websites */}
          <div>
            <h3 className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-wider">
              Blocked Websites ({challenge.distractions?.length || 0})
            </h3>
            {challenge.distractions && challenge.distractions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {challenge.distractions.map((site, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
                  >
                    <div className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-xs text-muted-foreground border border-border font-mono">
                      {site.url.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-foreground truncate font-mono">
                      {site.url}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No websites blocked.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="focus-ring w-full py-3 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-full font-mono text-sm transition-colors border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

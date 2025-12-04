"use client";

import React, { useEffect, useRef } from "react";
import { Challenge, ChallengeType } from "@/services/challenges";

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
      document.body.style.overflow = "hidden"; // Prevent scrolling
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
    // Ensure the date string is treated as UTC if it doesn't have timezone info
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-[#18181B]/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#27272A] flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white font-mono tracking-tight">
              {challenge.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded border font-mono ${
                challenge.completed 
                  ? "bg-green-500/10 text-green-400 border-green-500/20" 
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>
                {challenge.completed ? "Completed" : "Active"}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-[#27272A] text-gray-400 rounded border border-[#3F3F46] font-mono">
                {challenge.challenge_type === ChallengeType.TIME_BASED ? "Time Based" : "Toggle"}
              </span>
              {challenge.strict_mode && (
                <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-400 rounded border border-orange-500/20 font-mono">
                  Strict Mode
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#27272A] text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Description */}
          {challenge.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2 font-mono uppercase tracking-wider">Description</h3>
              <p className="text-gray-200 text-sm leading-relaxed font-mono">
                {challenge.description}
              </p>
            </div>
          )}

          {/* Time Details */}
          {challenge.challenge_type === ChallengeType.TIME_BASED && challenge.time_based_details && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#27272A]/50 rounded-lg border border-[#27272A]">
                <h3 className="text-xs font-medium text-gray-500 mb-1 font-mono uppercase">Start Date</h3>
                <p className="text-sm text-white font-mono">
                  {formatDate(challenge.time_based_details.start_date)}
                </p>
              </div>
              <div className="p-3 bg-[#27272A]/50 rounded-lg border border-[#27272A]">
                <h3 className="text-xs font-medium text-gray-500 mb-1 font-mono uppercase">End Date</h3>
                <p className="text-sm text-white font-mono">
                  {formatDate(challenge.time_based_details.end_date)}
                </p>
              </div>
            </div>
          )}

          {/* Toggle Details */}
          {challenge.challenge_type === ChallengeType.TOGGLE && challenge.toggle_details && (
            <div className="p-4 bg-[#27272A]/50 rounded-lg border border-[#27272A] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white font-mono">Current Status</h3>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  This challenge is currently {challenge.toggle_details.is_active ? "active" : "inactive"}.
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                challenge.toggle_details.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-600"
              }`} />
            </div>
          )}

          {/* Participants */}
          {challenge.participants && challenge.participants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 font-mono uppercase tracking-wider">
                Participants ({challenge.participants.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {challenge.participants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#27272A] rounded-full border border-[#3F3F46]"
                  >
                    <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-200 font-mono">{participant.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blocked Websites */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 font-mono uppercase tracking-wider">
              Blocked Websites ({challenge.distractions?.length || 0})
            </h3>
            {challenge.distractions && challenge.distractions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {challenge.distractions.map((site, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-[#27272A] rounded border border-[#3F3F46]">
                    <div className="w-6 h-6 rounded-full bg-[#18181B] flex items-center justify-center text-xs text-gray-400 border border-[#3F3F46]">
                      {site.url.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-200 truncate font-mono">{site.url}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic font-mono">No websites blocked.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#18181B]/50">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-[#27272A] hover:bg-[#3F3F46] text-white rounded-lg font-medium transition-colors font-mono text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

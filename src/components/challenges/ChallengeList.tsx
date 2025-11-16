"use client";

import React, { useState, useEffect } from "react";
import {
  getAllChallenges,
  getMyChallenges,
  getMyCreatedChallenges,
  joinChallenge,
  toggleChallengeStatus,
  Challenge,
} from "@/services/challenges";
import ChallengeCard from "./ChallengeCard";

type TabType = "all" | "my-challenges" | "created";

interface ChallengeListProps {
  activeTab?: TabType;
  onCreateClick?: () => void;
}

export default function ChallengeList({
  activeTab = "all",
  onCreateClick,
}: ChallengeListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab);
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<Set<number>>(new Set());

  const loadChallenges = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: Challenge[];
      console.log("Loading challenges for tab:", currentTab);
      switch (currentTab) {
        case "my-challenges":
          console.log("Fetching my challenges...");
          data = await getMyChallenges();
          console.log("My challenges loaded:", data);
          break;
        case "created":
          console.log("Fetching created challenges...");
          data = await getMyCreatedChallenges();
          console.log("Created challenges loaded:", data);
          break;
        default:
          console.log("Fetching all challenges...");
          data = await getAllChallenges();
          console.log("All challenges loaded:", data);
          
          // Also fetch user's joined challenges to know which ones to hide Join button for
          try {
            const myJoinedChallenges = await getMyChallenges();
            const joinedIds = new Set(myJoinedChallenges.map(c => c.id));
            setJoinedChallengeIds(joinedIds);
            console.log("User has joined challenge IDs:", Array.from(joinedIds));
          } catch (err) {
            console.error("Failed to fetch joined challenges:", err);
            // Continue anyway, worst case user sees Join button for already joined challenges
          }
      }
      setChallenges(data);
    } catch (err: any) {
      console.error("Error loading challenges:", err);
      setError(err.message || "Failed to load challenges");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      await joinChallenge(challengeId);
      // Reload challenges to reflect the change
      await loadChallenges();
    } catch (err: any) {
      alert(err.message || "Failed to join challenge");
    }
  };

  const handleToggleChallenge = async (challengeId: number) => {
    try {
      // Optimistically update the UI first
      setChallenges(prevChallenges =>
        prevChallenges.map(challenge => {
          if (challenge.id === challengeId && challenge.toggle_details) {
            return {
              ...challenge,
              toggle_details: {
                ...challenge.toggle_details,
                is_active: !challenge.toggle_details.is_active,
              },
            };
          }
          return challenge;
        })
      );

      // Then make the API call
      await toggleChallengeStatus(challengeId);
    } catch (err: any) {
      // On error, revert by reloading
      alert(err.message || "Failed to toggle challenge");
      await loadChallenges();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs - Glassmorphism Style */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCurrentTab("all")}
            className={`px-4 py-2 rounded-lg font-medium font-mono transition-all duration-300 ${
              currentTab === "all"
                ? "bg-slate-700/50 backdrop-blur-sm text-white shadow-md border border-white/20"
                : "bg-slate-100/40 backdrop-blur-sm text-slate-700 hover:bg-slate-200/50 border border-slate-300/20"
            }`}
          >
            All Challenges
          </button>
          <button
            onClick={() => setCurrentTab("my-challenges")}
            className={`px-4 py-2 rounded-lg font-medium font-mono transition-all duration-300 ${
              currentTab === "my-challenges"
                ? "bg-slate-700/50 backdrop-blur-sm text-white shadow-md border border-white/20"
                : "bg-slate-100/40 backdrop-blur-sm text-slate-700 hover:bg-slate-200/50 border border-slate-300/20"
            }`}
          >
            My Challenges
          </button>
          <button
            onClick={() => setCurrentTab("created")}
            className={`px-4 py-2 rounded-lg font-medium font-mono transition-all duration-300 ${
              currentTab === "created"
                ? "bg-slate-700/50 backdrop-blur-sm text-white shadow-md border border-white/20"
                : "bg-slate-100/40 backdrop-blur-sm text-slate-700 hover:bg-slate-200/50 border border-slate-300/20"
            }`}
          >
            Created by Me
          </button>
        </div>

        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-green-600/80 backdrop-blur-sm hover:bg-green-700/80 text-white font-medium font-mono rounded-lg transition-all duration-300 shadow-md border border-white/20"
          >
            + New Challenge
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-700 font-mono">Loading challenges...</p>
        </div>
      )}

      {/* Error State - Glass Card */}
      {error && (
        <div className="p-4 bg-red-100/60 backdrop-blur-sm border border-red-300/40 rounded-lg text-red-800 shadow-md">
          <p className="font-medium font-mono">Error loading challenges</p>
          <p className="text-sm mt-1 font-mono">{error}</p>
          <button
            onClick={loadChallenges}
            className="mt-3 text-sm text-red-700 hover:text-red-800 underline font-mono"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State - Glass Card */}
      {!isLoading && !error && challenges.length === 0 && (
        <div className="text-center py-12 bg-slate-100/30 backdrop-blur-sm rounded-xl border border-slate-300/20">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2 font-mono">
            {currentTab === "created"
              ? "No challenges created yet"
              : currentTab === "my-challenges"
              ? "No challenges joined yet"
              : "No challenges available"}
          </h3>
          <p className="text-slate-600 mb-6 font-mono text-sm">
            {currentTab === "created"
              ? "Create your first challenge to get started!"
              : currentTab === "my-challenges"
              ? "Join a challenge to start tracking your progress"
              : "Be the first to create a challenge!"}
          </p>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="px-6 py-3 bg-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 text-white font-medium font-mono rounded-lg transition-all duration-300 shadow-md border border-white/20"
            >
              Create Challenge
            </button>
          )}
        </div>
      )}

      {/* Challenge Grid - Tighter spacing for Notion style */}
      {!isLoading && !error && challenges.length > 0 && (
        <div className="grid gap-2">
          {challenges.map((challenge) => {
            const hasJoined = joinedChallengeIds.has(challenge.id);
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={currentTab === "all" && !hasJoined ? handleJoinChallenge : undefined}
                onToggle={
                  currentTab === "created" || currentTab === "my-challenges" 
                    ? handleToggleChallenge 
                    : undefined
                }
                showActions={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}


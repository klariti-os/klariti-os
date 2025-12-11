"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Challenge,
  ChallengeType,
} from "@/services/challenges";
import ChallengeCard from "./ChallengeCard";
import ChallengeCardSkeleton from "./ChallengeCardSkeleton";
import ChallengeDetailModal from "./ChallengeDetailModal";
import CreateChallengeForm from "./CreateChallengeForm";
import { useChallengeWebSocket } from "@/hooks/useChallengeWebSocket";
import { 
  useChallenges, 
  useMyChallenges, 
  useMyCreatedChallenges, 
  useJoinChallenge, 
  useToggleChallenge,
  challengeKeys
} from "@/hooks/useChallenges";
import { useQueryClient } from "@tanstack/react-query";

type TabType = "all" | "my-challenges" | "created";

interface ChallengeListProps {
  activeTab?: TabType;
  onCreateClick?: () => void;
}

// Helper to sort challenges
const sortChallenges = (challenges: Challenge[]) => {
  return [...challenges].sort((a, b) => {
    // Helper to determine challenge status rank
    // 0: Active (Top priority)
    // 1: Upcoming
    // 2: Paused (Toggle OFF)
    // 3: Ended (Lowest priority)
    const getStatusRank = (c: Challenge) => {
      if (c.completed) return 3;
      
      if (c.challenge_type === ChallengeType.TOGGLE) {
        // Treat all toggle challenges as equal rank (0) regardless of active status
        // so they don't jump around when toggled.
        // We handle "Paused" simply by the visual switch state, not list position.
        return 0;
      }
      
      if (c.challenge_type === ChallengeType.TIME_BASED && c.time_based_details) {
        const now = new Date();
        // Ensure UTC handling matches other components
        const startString = c.time_based_details.start_date;
        const endString = c.time_based_details.end_date;
        const start = new Date(startString.endsWith("Z") ? startString : `${startString}Z`);
        const end = new Date(endString.endsWith("Z") ? endString : `${endString}Z`);
        
        if (now > end) return 3; // Ended
        if (now < start) return 1; // Upcoming
        return 0; // Active
      }
      
      return 2; // Default fallback
    };

    const rankA = getStatusRank(a);
    const rankB = getStatusRank(b);

    if (rankA !== rankB) {
      return rankA - rankB; // Lower rank (higher priority) first
    }

    // Secondary sort:
    // For Ended challenges (Rank 3), sort by end date descending (most recently ended first)
    if (rankA === 3) {
      const getEndDate = (c: Challenge) => {
        if (c.time_based_details) {
           const endString = c.time_based_details.end_date;
           return new Date(endString.endsWith("Z") ? endString : `${endString}Z`).getTime();
        }
        return 0;
      };
      return getEndDate(b) - getEndDate(a);
    }

    // For others, sort by ID descending (newest created first)
    return b.id - a.id;
  });
};

export default function ChallengeList({
  activeTab = "all",
  onCreateClick,
}: ChallengeListProps) {
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEnded, setShowEnded] = useState(false);
  const [showUnindexed, setShowUnindexed] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  // We fetch myChallenges always if we are on 'all' or 'my-challenges' to check joined status
  const { 
    data: allChallenges, 
    isLoading: isLoadingAll,
    error: errorAll
  } = useChallenges(false, 0, 100);

  const { 
    data: myChallenges, 
    isLoading: isLoadingMy,
    error: errorMy
  } = useMyChallenges(0, 100);

  const { 
    data: createdChallenges, 
    isLoading: isLoadingCreated,
    error: errorCreated
  } = useMyCreatedChallenges(0, 100);

  // Mutations
  const joinMutation = useJoinChallenge();
  const toggleMutation = useToggleChallenge();

  // Derived state
  const joinedChallengeIds = React.useMemo(() => {
    if (!myChallenges) return new Set<number>();
    return new Set(myChallenges.map(c => c.id));
  }, [myChallenges]);

  // Determine current list and state
  let challenges: Challenge[] = [];
  let isLoading = false;
  let error: string | null = null;

  switch (currentTab) {
    case "all":
      challenges = allChallenges || [];
      isLoading = isLoadingAll || isLoadingMy;
      if (errorAll) error = (errorAll as Error).message;
      break;
    case "my-challenges":
      challenges = myChallenges || [];
      isLoading = isLoadingMy;
      if (errorMy) error = (errorMy as Error).message;
      break;
    case "created":
      challenges = createdChallenges || [];
      isLoading = isLoadingCreated;
      if (errorCreated) error = (errorCreated as Error).message;
      break;
  }

  // Handle real-time updates
  const handleChallengeUpdate = useCallback((challengeId: number, isActive: boolean, updatedChallenge: Challenge) => {
    console.log("WebSocket update received:", challengeId, isActive);
    
    // Helper to update a specific list in cache
    const updateList = (queryKey: any) => {
      queryClient.setQueryData(queryKey, (oldData: Challenge[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(c => {
          if (c.id === challengeId) {
            return {
              ...c,
              ...updatedChallenge,
              // specific toggle logic if needed, but updatedChallenge usually has new state
              toggle_details: updatedChallenge.toggle_details || c.toggle_details
            };
          }
          return c;
        });
      });
    };

    updateList(challengeKeys.list(false, 0, 100));
    updateList(challengeKeys.myChallenges(0, 100));
    updateList(challengeKeys.myCreated(0, 100));
    // Also update detail view if relevant
    queryClient.setQueryData(challengeKeys.detail(challengeId), (old: Challenge | undefined) => {
      if (!old) return old;
      return { ...old, ...updatedChallenge };
    });
  }, [queryClient]);

  const handleParticipantJoined = useCallback((challengeId: number, updatedChallenge: Challenge) => {
    console.log("WebSocket participant joined:", challengeId);
    
    // We update the challenge in all lists to reflect the new participant count/avatars
    const updateList = (queryKey: any) => {
      queryClient.setQueryData(queryKey, (oldData: Challenge[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(c => {
          if (c.id === challengeId) {
            // Merge the updated challenge data which contains the new participant list
            return {
              ...c,
              ...updatedChallenge
            };
          }
          return c;
        });
      });
    };

    updateList(challengeKeys.list(false, 0, 100));
    updateList(challengeKeys.myChallenges(0, 100));
    updateList(challengeKeys.myCreated(0, 100));
    
    // Also update detail
    queryClient.setQueryData(challengeKeys.detail(challengeId), (old: Challenge | undefined) => {
      if (!old) return old;
      return { ...old, ...updatedChallenge };
    });
  }, [queryClient]);
  
  const handleChallengeCreated = useCallback((newChallenge: Challenge) => {
    console.log("WebSocket challenge created:", newChallenge.id);

    // Add to 'all' list
    queryClient.setQueryData(challengeKeys.list(false, 0, 100), (oldData: Challenge[] | undefined) => {
      // Logic: Add to top of list if it doesn't exist
      if (!oldData) return [newChallenge];
      if (oldData.some(c => c.id === newChallenge.id)) return oldData;
      return [newChallenge, ...oldData];
    });

    // We don't necessarily add to 'my-challenges' or 'my-created' here because 
    // those usually imply current user context which we can't fully guarantee from global broadcast 
    // unless we check IDs. But for 'all' public feed, it's safe.
  }, [queryClient]);

  // Connect to WebSocket
  const { isConnected } = useChallengeWebSocket({
    onChallengeToggled: handleChallengeUpdate,
    onParticipantJoined: handleParticipantJoined,
    onChallengeCreated: handleChallengeCreated,
    onConnect: () => console.log("Connected to challenge updates"),
    onDisconnect: () => console.log("Disconnected from challenge updates"),
  });

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // React Query handles invalidation automatically in the mutation, but if CreateForm doesn't use the hook:
    queryClient.invalidateQueries({ queryKey: challengeKeys.all });
  };

  const handleJoinChallenge = async (challengeId: number) => {
    joinMutation.mutate(challengeId, {
      onError: (err: any) => alert(err.message || "Failed to join challenge"),
    });
  };

  const handleToggleChallenge = async (challengeId: number) => {
    // Optimistic update is already tricky with just mutation hook unless we implement onMutate
    // But since we use WebSocket for real-time, the toggle trigger typically also comes back via WS if implemented right,
    // or we just wait for mutation success which invalidates.
    // For now, let's rely on standard mutation flow + invalidation. 
    // If we want optimistic UI:
    toggleMutation.mutate(challengeId, {
      onError: (err: any) => alert(err.message || "Failed to toggle challenge"),
    });
  };

  const handleCardClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedChallenge(null), 300); 
  };

  // Filter challenges
  const sortedChallenges = sortChallenges(challenges);
  
  const filteredChallenges = sortedChallenges
    .filter((challenge) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        challenge.name.toLowerCase().includes(query) ||
        challenge.description?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      // Filter out ended challenges unless showEnded is true
      if (!showEnded) {
        if (challenge.completed) return false;
        
        // For time-based challenges, check if end date has passed
        if (challenge.challenge_type === ChallengeType.TIME_BASED && challenge.time_based_details) {
          const endDate = new Date(challenge.time_based_details.end_date);
          if (endDate < new Date()) return false;
        }
      }

      // Filter out unindexed challenges (no websites) unless showUnindexed is true
      const hasWebsites = challenge.distractions && challenge.distractions.length > 0;
      if (!showUnindexed && !hasWebsites) return false;

      return true;
    });

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isConnected ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
          )}
        </span>
      </div>

    

      {/* Controls Header: Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Filters Dropdown */}
        <div className="relative z-30">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium font-mono transition-all duration-300 border ${
              isFilterOpen || showEnded || showUnindexed || currentTab !== "all"
                ? "bg-slate-700/50 text-white border-white/20 shadow-md"
                : "bg-[#18181B]/40 text-gray-400 border-white/10 hover:text-white"
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="mr-1">
              {currentTab === "all" && "All Challenges"}
              {currentTab === "my-challenges" && "My Challenges"}
              {currentTab === "created" && "Created by Me"}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsFilterOpen(false)}
              ></div>
              <div className="absolute left-0 mt-2 w-56 bg-[#18181B] border border-white/10 rounded-lg shadow-xl z-20 backdrop-blur-xl p-2 space-y-3">
                {/* View Selection Section */}
                <div className="space-y-1">
                  <div className="px-3 py-1 text-xs font-mono text-gray-500 uppercase tracking-wider">View</div>
                  <button
                    onClick={() => {
                      setCurrentTab("all");
                      // Keep open to allow multiple selections if desired, or close
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md font-mono text-sm transition-colors flex items-center justify-between ${
                      currentTab === "all" 
                        ? "bg-green-600/20 text-green-400" 
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    All Challenges
                    {currentTab === "all" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab("my-challenges");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md font-mono text-sm transition-colors flex items-center justify-between ${
                      currentTab === "my-challenges" 
                        ? "bg-green-600/20 text-green-400" 
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    My Challenges
                    {currentTab === "my-challenges" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab("created");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md font-mono text-sm transition-colors flex items-center justify-between ${
                      currentTab === "created" 
                        ? "bg-green-600/20 text-green-400" 
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    Created by Me
                    {currentTab === "created" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                </div>

                <div className="h-px bg-white/10 mx-2"></div>

                {/* Filters Section */}
                <div className="space-y-1">
                  <div className="px-3 py-1 text-xs font-mono text-gray-500 uppercase tracking-wider">Filters</div>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      showEnded ? "bg-green-500 border-green-500" : "border-gray-500 group-hover:border-gray-400"
                    }`}>
                      {showEnded && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-300 font-mono group-hover:text-white">Show Ended</span>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={showEnded} 
                      onChange={() => setShowEnded(!showEnded)} 
                    />
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      showUnindexed ? "bg-green-500 border-green-500" : "border-gray-500 group-hover:border-gray-400"
                    }`}>
                      {showUnindexed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-300 font-mono group-hover:text-white">Show Unindexed</span>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={showUnindexed} 
                      onChange={() => setShowUnindexed(!showUnindexed)} 
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center: New Challenge Button */}
        {onCreateClick && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-green-600/80 backdrop-blur-sm hover:bg-green-700/80 text-white font-medium font-mono rounded-lg transition-all duration-300 shadow-md border border-white/20 whitespace-nowrap"
          >
            + New Challenge
          </button>
        )}

        {/* Right Side: Search */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-white/50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#18181B]/40 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent font-mono text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Loading State - Skeletons */}
      {isLoading && filteredChallenges.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ChallengeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State - Glass Card */}
      {error && filteredChallenges.length === 0 && (
        <div className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg text-red-400 shadow-md">
          <p className="font-medium font-mono">Error loading challenges</p>
          <p className="text-sm mt-1 font-mono">{error}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: challengeKeys.all })}
            className="mt-3 text-sm text-red-400 hover:text-red-300 underline font-mono"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State - Glass Card */}
      {!isLoading && !error && filteredChallenges.length === 0 && (
        <div className="text-center py-16 bg-[#18181B]/40 backdrop-blur-sm rounded-xl border border-white/5">
          <div className="text-6xl mb-6 opacity-50">
            {searchQuery ? "🔍" : "🎯"}
          </div>
          <h3 className="text-xl font-semibold text-white mb-2 font-mono">
            {searchQuery
              ? "No challenges found"
              : currentTab === "created"
              ? "No challenges created yet"
              : currentTab === "my-challenges"
              ? "No challenges joined yet"
              : "No challenges available"}
          </h3>
          <p className="text-gray-400 mb-8 font-mono text-sm max-w-md mx-auto">
            {searchQuery
              ? `No results matching "${searchQuery}"`
              : currentTab === "created"
              ? "Create your first challenge to get started!"
              : currentTab === "my-challenges"
              ? "Join a challenge to start tracking your progress"
              : "Be the first to create a challenge!"}
          </p>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowCreateForm(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#18181B]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <CreateChallengeForm
                isOpen={showCreateForm}
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Challenge Grid - Responsive Grid Layout */}
      {(filteredChallenges.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={currentTab}>
          {filteredChallenges.map((challenge, index) => {
            const hasJoined = joinedChallengeIds.has(challenge.id);
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={currentTab === "all" && !hasJoined ? handleJoinChallenge : undefined}
                onToggle={
                  currentTab === "created" || currentTab === "my-challenges" || hasJoined
                    ? handleToggleChallenge 
                    : undefined
                }
                onClick={handleCardClick}
                showActions={true}
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.05}s forwards`,
                  opacity: 0 // Start invisible for animation
                }}
                className="h-full"
              />
            );
          })}
        </div>
      )}
      <ChallengeDetailModal
        challenge={selectedChallenge}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}


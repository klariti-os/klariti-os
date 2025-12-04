"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getAllChallenges,
  getMyChallenges,
  getMyCreatedChallenges,
  joinChallenge,
  toggleChallengeStatus,
  Challenge,
  ChallengeType,
} from "@/services/challenges";
import ChallengeCard from "./ChallengeCard";
import ChallengeDetailModal from "./ChallengeDetailModal";
import CreateChallengeForm from "./CreateChallengeForm";
import { useChallengeWebSocket } from "@/hooks/useChallengeWebSocket";

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
        return c.toggle_details?.is_active ? 0 : 2;
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
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab);
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<Set<number>>(new Set());
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Cache state to store challenges for each tab
  const [challengesCache, setChallengesCache] = useState<Record<TabType, Challenge[] | null>>({
    "all": null,
    "my-challenges": null,
    "created": null
  });

  // Helper to update cache for all tabs when a challenge changes
  const updateAllCaches = useCallback((updater: (challenges: Challenge[]) => Challenge[]) => {
    setChallengesCache(prevCache => {
      const newCache = { ...prevCache };
      (Object.keys(newCache) as TabType[]).forEach(tab => {
        if (newCache[tab]) {
          const updatedData = updater(newCache[tab]!);
          newCache[tab] = updatedData;
          // Update localStorage for this tab
          localStorage.setItem(`challenges_cache_${tab}`, JSON.stringify(updatedData));
        }
      });
      return newCache;
    });
    
    // Also update current view
    setChallenges(prev => updater(prev));
  }, []);

  // Handle real-time challenge updates via WebSocket
  const handleChallengeUpdate = useCallback((challengeId: number, isActive: boolean, updatedChallenge: Challenge) => {
    console.log("WebSocket update received:", challengeId, isActive);
    
    updateAllCaches(currentList => 
      currentList.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            ...updatedChallenge,
            toggle_details: updatedChallenge.toggle_details || challenge.toggle_details,
          };
        }
        return challenge;
      })
    );
  }, [updateAllCaches]);

  // Connect to WebSocket for real-time updates
  const { isConnected } = useChallengeWebSocket({
    onChallengeToggled: handleChallengeUpdate,
    onConnect: () => {
      console.log("Connected to challenge updates");
      // Refresh data on connection to ensure sync across sessions
      loadChallenges(true);
    },
    onDisconnect: () => console.log("Disconnected from challenge updates"),
  });

  const loadChallenges = async (forceRefresh = false) => {
    const cacheKey = `challenges_cache_${currentTab}`;
    const joinedCacheKey = `challenges_joined_ids`;
    let hasCachedData = false;

    // If we have cached data and not forcing refresh, use it
    if (!forceRefresh) {
      // Check in-memory cache first
      if (challengesCache[currentTab]) {
        setChallenges(challengesCache[currentTab]!);
        hasCachedData = true;
        setIsLoading(false);
      } else {
        // Check localStorage
        try {
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            setChallenges(parsedData);
            setChallengesCache(prev => ({
              ...prev,
              [currentTab]: parsedData
            }));
            hasCachedData = true;
            setIsLoading(false); // Show cached data immediately
            
            // Also load joined IDs from cache
            const cachedJoinedIds = localStorage.getItem(joinedCacheKey);
            if (cachedJoinedIds) {
              setJoinedChallengeIds(new Set(JSON.parse(cachedJoinedIds)));
            }
          }
        } catch (e) {
          console.warn("Failed to load from localStorage", e);
        }
      }
    }

    // If we didn't find cache or are forcing refresh, show loading only if we don't have data displayed
    // This prevents the spinner from showing if we already have data (silent refresh)
    if (!hasCachedData && !challenges.length && !challengesCache[currentTab]) {
      setIsLoading(true);
    }
    setError(null);

    try {
      let data: Challenge[];
      console.log("Loading challenges for tab:", currentTab);
      switch (currentTab) {
        case "my-challenges":
          data = await getMyChallenges();
          break;
        case "created":
          data = await getMyCreatedChallenges();
          break;
        default:
          data = await getAllChallenges();
          
          // Also fetch user's joined challenges to know which ones to hide Join button for
          try {
            const myJoinedChallenges = await getMyChallenges();
            const joinedIds = new Set(myJoinedChallenges.map(c => c.id));
            setJoinedChallengeIds(joinedIds);
            // Cache joined IDs
            localStorage.setItem(joinedCacheKey, JSON.stringify(Array.from(joinedIds)));
          } catch (err) {
            console.error("Failed to fetch joined challenges:", err);
          }
      }
      
      // Update cache and current view
      const sortedData = sortChallenges(data);
      setChallengesCache(prev => ({
        ...prev,
        [currentTab]: sortedData
      }));
      setChallenges(sortedData);
      
      // Save to localStorage
      localStorage.setItem(cacheKey, JSON.stringify(sortedData));
      
    } catch (err: any) {
      console.error("Error loading challenges:", err);
      // Only show error if we don't have cached data
      if (challenges.length === 0) {
        setError(err.message || "Failed to load challenges");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadChallenges(true);
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      await joinChallenge(challengeId);
      // Force reload to get fresh state including the new join
      await loadChallenges(true);
      
      // Also invalidate other tabs since join status changed
      setChallengesCache(prev => ({
        ...prev,
        "my-challenges": null // Will force refresh when visiting this tab
      }));
    } catch (err: any) {
      alert(err.message || "Failed to join challenge");
    }
  };

  const handleToggleChallenge = async (challengeId: number) => {
    try {
      // Optimistically update the UI and Cache first
      updateAllCaches(currentList => 
        currentList.map(challenge => {
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
      await loadChallenges(true);
    }
  };

  const handleCardClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedChallenge(null), 300); // Clear after animation
  };


  const [searchQuery, setSearchQuery] = useState("");
  const [showEnded, setShowEnded] = useState(false);
  const [showUnindexed, setShowUnindexed] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter challenges
  const filteredChallenges = challenges
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
      {isConnected && (
        <div className="flex items-center gap-2 text-xs text-green-600 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live updates enabled
        </div>
      )}

    

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

      {/* Loading State */}
      {isLoading && filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white/20 border-r-white/80"></div>
          <p className="mt-4 text-gray-400 font-mono">Loading challenges...</p>
        </div>
      )}

      {/* Error State - Glass Card */}
      {error && filteredChallenges.length === 0 && (
        <div className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg text-red-400 shadow-md">
          <p className="font-medium font-mono">Error loading challenges</p>
          <p className="text-sm mt-1 font-mono">{error}</p>
          <button
            onClick={() => loadChallenges(true)}
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


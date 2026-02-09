"use client";

import React, { useState, useCallback } from "react";
import { Challenge, ChallengeType } from "@/services/challenges";
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
  challengeKeys,
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
    const getStatusRank = (c: Challenge) => {
      if (c.completed) return 3;

      if (c.challenge_type === ChallengeType.TOGGLE) {
        return 0;
      }

      if (
        c.challenge_type === ChallengeType.TIME_BASED &&
        c.time_based_details
      ) {
        const now = new Date();
        const startString = c.time_based_details.start_date;
        const endString = c.time_based_details.end_date;
        const start = new Date(
          startString.endsWith("Z") ? startString : `${startString}Z`,
        );
        const end = new Date(
          endString.endsWith("Z") ? endString : `${endString}Z`,
        );

        if (now > end) return 3;
        if (now < start) return 1;
        return 0;
      }

      return 2;
    };

    const rankA = getStatusRank(a);
    const rankB = getStatusRank(b);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    if (rankA === 3) {
      const getEndDate = (c: Challenge) => {
        if (c.time_based_details) {
          const endString = c.time_based_details.end_date;
          return new Date(
            endString.endsWith("Z") ? endString : `${endString}Z`,
          ).getTime();
        }
        return 0;
      };
      return getEndDate(b) - getEndDate(a);
    }

    return b.id - a.id;
  });
};

export default function ChallengeList({
  activeTab = "all",
  onCreateClick,
}: ChallengeListProps) {
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEnded, setShowEnded] = useState(false);
  const [showUnindexed, setShowUnindexed] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const {
    data: allChallenges,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useChallenges(false, 0, 100);

  const {
    data: myChallenges,
    isLoading: isLoadingMy,
    error: errorMy,
  } = useMyChallenges(0, 100);

  const {
    data: createdChallenges,
    isLoading: isLoadingCreated,
    error: errorCreated,
  } = useMyCreatedChallenges(0, 100);

  // Mutations
  const joinMutation = useJoinChallenge();
  const toggleMutation = useToggleChallenge();

  // Derived state
  const joinedChallengeIds = React.useMemo(() => {
    if (!myChallenges) return new Set<number>();
    return new Set(myChallenges.map((c) => c.id));
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
  const handleChallengeUpdate = useCallback(
    (challengeId: number, isActive: boolean, updatedChallenge: Challenge) => {
      console.log("WebSocket update received:", challengeId, isActive);

      const updateList = (queryKey: any) => {
        queryClient.setQueryData(
          queryKey,
          (oldData: Challenge[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map((c) => {
              if (c.id === challengeId) {
                return {
                  ...c,
                  ...updatedChallenge,
                  toggle_details:
                    updatedChallenge.toggle_details || c.toggle_details,
                };
              }
              return c;
            });
          },
        );
      };

      updateList(challengeKeys.list(false, 0, 100));
      updateList(challengeKeys.myChallenges(0, 100));
      updateList(challengeKeys.myCreated(0, 100));
      queryClient.setQueryData(
        challengeKeys.detail(challengeId),
        (old: Challenge | undefined) => {
          if (!old) return old;
          return { ...old, ...updatedChallenge };
        },
      );
    },
    [queryClient],
  );

  const handleParticipantJoined = useCallback(
    (challengeId: number, updatedChallenge: Challenge) => {
      console.log("WebSocket participant joined:", challengeId);

      const updateList = (queryKey: any) => {
        queryClient.setQueryData(
          queryKey,
          (oldData: Challenge[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map((c) => {
              if (c.id === challengeId) {
                return {
                  ...c,
                  ...updatedChallenge,
                };
              }
              return c;
            });
          },
        );
      };

      updateList(challengeKeys.list(false, 0, 100));
      updateList(challengeKeys.myChallenges(0, 100));
      updateList(challengeKeys.myCreated(0, 100));

      queryClient.setQueryData(
        challengeKeys.detail(challengeId),
        (old: Challenge | undefined) => {
          if (!old) return old;
          return { ...old, ...updatedChallenge };
        },
      );
    },
    [queryClient],
  );

  const handleChallengeCreated = useCallback(
    (newChallenge: Challenge) => {
      console.log("WebSocket challenge created:", newChallenge.id);

      queryClient.setQueryData(
        challengeKeys.list(false, 0, 100),
        (oldData: Challenge[] | undefined) => {
          if (!oldData) return [newChallenge];
          if (oldData.some((c) => c.id === newChallenge.id)) return oldData;
          return [newChallenge, ...oldData];
        },
      );
    },
    [queryClient],
  );

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
    queryClient.invalidateQueries({ queryKey: challengeKeys.all });
  };

  const handleJoinChallenge = async (challengeId: number) => {
    joinMutation.mutate(challengeId, {
      onError: (err: any) => alert(err.message || "Failed to join challenge"),
    });
  };

  const handleToggleChallenge = async (challengeId: number) => {
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

  const filteredChallenges = sortedChallenges.filter((challenge) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      challenge.name.toLowerCase().includes(query) ||
      challenge.description?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (!showEnded) {
      if (challenge.completed) return false;

      if (
        challenge.challenge_type === ChallengeType.TIME_BASED &&
        challenge.time_based_details
      ) {
        const endDate = new Date(challenge.time_based_details.end_date);
        if (endDate < new Date()) return false;
      }
    }

    const hasWebsites =
      challenge.distractions && challenge.distractions.length > 0;
    if (!showUnindexed && !hasWebsites) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isConnected ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/50"></span>
          )}
        </span>
      </div>

      {/* Controls Header: Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Filters Dropdown */}
        <div className="relative z-30">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`focus-ring flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs transition-all border bg-muted text-foreground border-border hover:border-foreground/40`}
            aria-haspopup="true"
            aria-expanded={isFilterOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="mr-1">
              {currentTab === "all" && "All Challenges"}
              {currentTab === "my-challenges" && "My Challenges"}
              {currentTab === "created" && "Created by Me"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isFilterOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              ></div>
              <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-20 p-2 space-y-3">
                {/* View Selection Section */}
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    View
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab("all");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs transition-colors flex items-center justify-between ${
                      currentTab === "all"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    All Challenges
                    {currentTab === "all" && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab("my-challenges");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs transition-colors flex items-center justify-between ${
                      currentTab === "my-challenges"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    My Challenges
                    {currentTab === "my-challenges" && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab("created");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs transition-colors flex items-center justify-between ${
                      currentTab === "created"
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    Created by Me
                    {currentTab === "created" && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="h-px bg-border mx-2"></div>

                {/* Filters Section */}
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    Filters
                  </div>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg cursor-pointer group">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        showEnded
                          ? "bg-primary border-primary"
                          : "border-border group-hover:border-muted-foreground"
                      }`}
                    >
                      {showEnded && (
                        <svg
                          className="w-3 h-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono group-hover:text-foreground">
                      Show Ended
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={showEnded}
                      onChange={() => setShowEnded(!showEnded)}
                    />
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg cursor-pointer group">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        showUnindexed
                          ? "bg-primary border-primary"
                          : "border-border group-hover:border-muted-foreground"
                      }`}
                    >
                      {showUnindexed && (
                        <svg
                          className="w-3 h-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono group-hover:text-foreground">
                      Show Unindexed
                    </span>
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
            className="focus-ring px-6 py-2.5 bg-foreground text-background font-mono text-xs rounded-full transition-opacity hover:opacity-80 border border-border shadow-sm"
          >
            + New Challenge
          </button>
        )}

        {/* Right Side: Search */}
        <div className="flex items-center gap-3">
          <div className="relative md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-muted-foreground"
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
              className="focus-ring w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full text-foreground placeholder-muted-foreground font-mono text-xs transition-colors focus:border-foreground/40"
            />
          </div>
        </div>
      </div>

      {/* Loading State - Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ChallengeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && filteredChallenges.length === 0 && (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
          <p className="font-mono text-sm font-medium">
            Error loading challenges
          </p>
          <p className="text-sm mt-1 font-mono opacity-80">{error}</p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: challengeKeys.all })
            }
            className="mt-3 text-sm text-destructive hover:underline font-mono"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredChallenges.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-border">
          <div className="text-5xl mb-6 opacity-40">
            {searchQuery ? "🔍" : "🎯"}
          </div>
          <h3 className="text-lg font-serif font-normal text-foreground mb-2">
            {searchQuery
              ? "No challenges found"
              : currentTab === "created"
                ? "No challenges created yet"
                : currentTab === "my-challenges"
                  ? "No challenges joined yet"
                  : "No challenges available"}
          </h3>
          <p className="text-muted-foreground font-mono text-xs max-w-sm mx-auto">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowCreateForm(false)}
        >
          <div
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
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

      {/* Challenge Grid */}
      {!isLoading && filteredChallenges.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          key={currentTab}
        >
          {filteredChallenges.map((challenge, index) => {
            const hasJoined = joinedChallengeIds.has(challenge.id);
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={
                  currentTab === "all" && !hasJoined
                    ? handleJoinChallenge
                    : undefined
                }
                onToggle={
                  currentTab === "created" ||
                  currentTab === "my-challenges" ||
                  hasJoined
                    ? handleToggleChallenge
                    : undefined
                }
                onClick={handleCardClick}
                showActions={true}
                style={{
                  animation: `fade-in-up 0.5s ease-out ${index * 0.05}s forwards`,
                  opacity: 0,
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8081";

interface Website {
  id: number;
  url: string;
  name: string | null;
  challenge_id: number;
}

interface Challenge {
  id: number;
  name: string;
  description: string | null;
  challenge_type: string;
  strict_mode: boolean;
  completed: boolean;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
  distracting_websites: Website[];
}

interface Participant {
  id: number;
  username: string;
}

interface ParticipantWithStatus extends Participant {
  isActive: boolean;
  isLoading: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my" | "available">("my");
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [participants, setParticipants] = useState<Record<number, ParticipantWithStatus[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth");
      return null;
    }
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch my challenges
  const fetchMyChallenges = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/challenges/my-challenges`, {
        headers,
      });

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/auth");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch challenges");

      const data = await res.json();
      setMyChallenges(data);

      // Fetch participants for each challenge
      data.forEach((challenge: Challenge) => {
        fetchParticipants(challenge.id);
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch available challenges
  const fetchAvailableChallenges = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/challenges/`, {
        headers,
      });

      if (!res.ok) throw new Error("Failed to fetch available challenges");

      const data = await res.json();
      // Filter only toggle-based challenges
      const toggleChallenges = data.filter(
        (c: Challenge) => c.challenge_type === "toggle"
      );
      setAvailableChallenges(toggleChallenges);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch participants for a challenge
  const fetchParticipants = async (challengeId: number) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(
        `${API_BASE}/challenges/${challengeId}/participants`,
        { headers }
      );

      if (!res.ok) throw new Error("Failed to fetch participants");

      const data: Participant[] = await res.json();
      
      // Initialize with loading state
      setParticipants((prev) => ({
        ...prev,
        [challengeId]: data.map((p) => ({
          ...p,
          isActive: false,
          isLoading: false,
        })),
      }));
    } catch (err: any) {
      console.error("Error fetching participants:", err);
    }
  };

  // Join a challenge
  const joinChallenge = async (challengeId: number) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/challenges/${challengeId}/join`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to join challenge");
      }

      // Refresh both lists
      await fetchMyChallenges();
      await fetchAvailableChallenges();
      
      // Switch to My Challenges tab
      setActiveTab("my");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Leave a challenge
  const leaveChallenge = async (challengeId: number) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    if (!confirm("Are you sure you want to leave this challenge?")) return;

    try {
      const res = await fetch(`${API_BASE}/challenges/${challengeId}/leave`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to leave challenge");
      }

      // Refresh both lists
      await fetchMyChallenges();
      await fetchAvailableChallenges();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle participant status (placeholder for now - will need backend support)
  const toggleParticipantStatus = async (
    challengeId: number,
    participantId: number
  ) => {
    // Update UI optimistically
    setParticipants((prev) => ({
      ...prev,
      [challengeId]: prev[challengeId].map((p) =>
        p.id === participantId
          ? { ...p, isActive: !p.isActive, isLoading: true }
          : p
      ),
    }));

    // Here you would call the toggle endpoint
    // For now, just simulate a delay
    setTimeout(() => {
      setParticipants((prev) => ({
        ...prev,
        [challengeId]: prev[challengeId].map((p) =>
          p.id === participantId ? { ...p, isLoading: false } : p
        ),
      }));
    }, 500);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchMyChallenges(), fetchAvailableChallenges()]);
      setIsLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="text-neutral-100 text-center">Loading...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-50 drop-shadow-sm">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-200">
          Profile • Blocked Sites • Challenges • Friends • Progress
        </p>
      </header>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md p-4 shadow-lg">
          <h2 className="font-medium text-neutral-100 mb-2">Profile</h2>
          <div className="text-sm text-neutral-200/80">
            username, streak, total focus time
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md p-4 md:col-span-2 shadow-lg">
          <h2 className="font-medium text-neutral-100 mb-2">Progress Summary</h2>
          <div className="text-sm text-neutral-200/80">
            distractions prevented, flashcards completed, hours focused
          </div>
        </div>
      </section>

      {/* Challenges Section with Tabs */}
      <section className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md shadow-lg overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "my"
                ? "bg-slate-600/60 text-neutral-50 border-b-2 border-blue-400"
                : "text-neutral-300 hover:bg-slate-600/30"
            }`}
          >
            My Challenges ({myChallenges.length})
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "available"
                ? "bg-slate-600/60 text-neutral-50 border-b-2 border-blue-400"
                : "text-neutral-300 hover:bg-slate-600/30"
            }`}
          >
            Available Challenges ({availableChallenges.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "my" ? (
            <div className="space-y-6">
              {myChallenges.length === 0 ? (
                <div className="text-center py-8 text-neutral-300">
                  You haven&apos;t joined any challenges yet. Check out available
                  challenges!
                </div>
              ) : (
                myChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="rounded-lg border border-white/10 bg-slate-600/30 p-5 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-50">
                          {challenge.name}
                        </h3>
                        {challenge.description && (
                          <p className="text-sm text-neutral-300 mt-1">
                            {challenge.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => leaveChallenge(challenge.id)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Leave
                      </button>
                    </div>

                    {/* Blocked Websites */}
                    {challenge.distracting_websites.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-neutral-200 mb-2">
                          Blocked Sites:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {challenge.distracting_websites.map((site) => (
                            <span
                              key={site.id}
                              className="px-2 py-1 text-xs bg-red-500/20 text-red-200 rounded"
                            >
                              {site.name || site.url}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Participants Toggle Buttons */}
                    {participants[challenge.id] &&
                      participants[challenge.id].length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-200 mb-3">
                            Participants:
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {participants[challenge.id].map((participant) => (
                              <button
                                key={participant.id}
                                onClick={() =>
                                  toggleParticipantStatus(
                                    challenge.id,
                                    participant.id
                                  )
                                }
                                disabled={participant.isLoading}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                  participant.isActive
                                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                                    : "bg-slate-500/30 text-neutral-300 hover:bg-slate-500/50"
                                } ${
                                  participant.isLoading
                                    ? "opacity-50 cursor-wait"
                                    : ""
                                }`}
                              >
                                {participant.username}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {availableChallenges.length === 0 ? (
                <div className="text-center py-8 text-neutral-300">
                  No challenges available at the moment.
                </div>
              ) : (
                availableChallenges.map((challenge) => {
                  const isJoined = myChallenges.some(
                    (c) => c.id === challenge.id
                  );
                  return (
                    <div
                      key={challenge.id}
                      className="rounded-lg border border-white/10 bg-slate-600/30 p-5 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-50">
                          {challenge.name}
                        </h3>
                        {challenge.description && (
                          <p className="text-sm text-neutral-300 mt-1">
                            {challenge.description}
                          </p>
                        )}
                        {challenge.distracting_websites.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-neutral-400">
                              Blocks:{" "}
                            </span>
                            <span className="text-xs text-neutral-300">
                              {challenge.distracting_websites
                                .map((w) => w.name || w.url)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => joinChallenge(challenge.id)}
                        disabled={isJoined}
                        className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isJoined
                            ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md p-4 shadow-lg">
          <h2 className="font-medium text-neutral-100 mb-2">Friends & Requests</h2>
          <div className="text-sm text-neutral-200/80">
            send/accept friend requests
          </div>
        </div>
      </section>
    </main>
  );
}

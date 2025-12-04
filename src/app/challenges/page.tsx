"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { NextPage } from "next";
import ChallengeList from "@/components/challenges/ChallengeList";
import CreateChallengeForm from "@/components/challenges/CreateChallengeForm";

const ChallengesPage: NextPage = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ProtectedRoute>
      <div className="px-6 pb-20">
        <main className="w-full max-w-6xl mx-auto mt-10">
          {/* Header */}
          <div className="mb-8 p-6 bg-[#18181B]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 font-mono">
                Welcome back, {user?.username || 'User'}
              </h1>
              <p className="text-gray-400 text-sm font-mono">
                Track your productivity challenges
              </p>
            </div>
          </div>

          {/* Challenge List */}
          <ChallengeList
            key={refreshKey}
            onCreateClick={() => setShowCreateForm(true)}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ChallengesPage;

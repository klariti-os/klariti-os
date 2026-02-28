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
      <div className="mx-auto max-w-content px-6 pb-32 pt-8">
        {/* Header */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h1 className="mb-1 font-serif text-xl font-normal text-foreground">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your productivity challenges.
          </p>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-1 font-serif text-lg font-normal text-foreground">
              Create New Challenge
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Set up a new challenge to improve your focus.
            </p>
            <CreateChallengeForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Challenge list */}
        <ChallengeList
          key={refreshKey}
          onCreateClick={() => setShowCreateForm(true)}
        />
      </div>
    </ProtectedRoute>
  );
};

export default ChallengesPage;

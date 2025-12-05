"use client";

import { useState } from "react";
import PillButton from "@/components/PillButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { NextPage } from "next";
import Link from "next/link";
import ChallengeList from "@/components/challenges/ChallengeList";
import CreateChallengeForm from "@/components/challenges/CreateChallengeForm";

const DashboardPage: NextPage = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ProtectedRoute>
      <div className="px-6 pb-32">
        <main className="w-full max-w-6xl mx-auto mt-10">
          {/* Welcome Section - Glassmorphism Style */}
          {user && (
            <div className="flex justify-between p-6 bg-slate-100 bg-opacity-[30%] backdrop-blur-sm rounded-xl border border-slate-300/20 shadow-[0_0_12px_rgba(90,94,82,0.3)]">
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2 font-mono">
                  Welcome back, {user.username}! 👋
                </h1>
                <p className="text-slate-700 font-mono text-sm">
                  Manage your challenges and track your progress
                </p>
              </div>

  
            </div>
          )}

          {/* Create Challenge Section - Glass Card */}
          {showCreateForm && (
            <div className="mb-8 p-6 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900 font-mono">
                  Create New Challenge
                </h2>
                <p className="text-sm text-slate-600 mt-1 font-mono">
                  Set up a new challenge to improve your focus and productivity
                </p>
              </div>
              <CreateChallengeForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}

          {/* Challenges List */}
          <div className="mb-12">
            <ChallengeList
              key={refreshKey}
              onCreateClick={() => setShowCreateForm(true)}
            />
          </div>

          {/* Divider with Glass Effect */}
          <div className="my-12 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent"></div>


          
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;

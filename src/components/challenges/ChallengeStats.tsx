"use client";

import React, { useEffect, useState } from "react";
import { getMyChallenges, getMyCreatedChallenges } from "@/services/challenges";

interface ChallengeStats {
  totalJoined: number;
  activeJoined: number;
  completedJoined: number;
  totalCreated: number;
  activeCreated: number;
}

export default function ChallengeStats() {
  const [stats, setStats] = useState<ChallengeStats>({
    totalJoined: 0,
    activeJoined: 0,
    completedJoined: 0,
    totalCreated: 0,
    activeCreated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [joined, created] = await Promise.all([
        getMyChallenges(),
        getMyCreatedChallenges(),
      ]);

      const activeJoined = joined.filter(
        (c) =>
          !c.completed &&
          (c.toggle_details?.is_active ||
            (c.time_based_details &&
              new Date(c.time_based_details.start_date) <= new Date() &&
              new Date(c.time_based_details.end_date) >= new Date()))
      ).length;

      const completedJoined = joined.filter((c) => c.completed).length;

      const activeCreated = created.filter(
        (c) =>
          !c.completed &&
          (c.toggle_details?.is_active ||
            (c.time_based_details &&
              new Date(c.time_based_details.start_date) <= new Date() &&
              new Date(c.time_based_details.end_date) >= new Date()))
      ).length;

      setStats({
        totalJoined: joined.length,
        activeJoined,
        completedJoined,
        totalCreated: created.length,
        activeCreated: activeCreated,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-2 bg-[#27272A]/50 rounded-lg border border-[#27272A] animate-pulse"
          >
            <div className="w-4 h-4 bg-white/10 rounded"></div>
            <div className="flex flex-col gap-1">
              <div className="h-4 w-8 bg-white/10 rounded"></div>
              <div className="h-3 w-16 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <StatCard
        value={stats.totalCreated}
        label="Created"
        icon="create"
      />
      <StatCard
        value={stats.activeCreated}
        label="Active"
        icon="active"
      />
      <StatCard
        value={stats.completedJoined}
        label="Completed"
        icon="completed"
      />
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  icon: "create" | "active" | "completed";
}

function StatCard({ value, label, icon }: StatCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case "create":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        );
      case "active":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "completed":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#27272A]/50 backdrop-blur-sm rounded-lg border border-[#27272A] transition-all duration-200 hover:bg-[#27272A]/70">
      <div className="text-white/60">
        {renderIcon()}
      </div>
      <div className="flex flex-col">
        <div className="text-base font-bold text-white font-mono">{value}</div>
        <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

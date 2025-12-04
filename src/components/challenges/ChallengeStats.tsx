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
      <div className="flex-col">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 animate-pulse">
            <div className="w-3 h-3 bg-white/10 rounded"></div>
            <div className="h-4 w-6 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-col">
      <StatItem value={stats.totalCreated} label="Created" icon="create" />
      <StatItem value={stats.activeCreated} label="Active" icon="active" />
      <StatItem value={stats.completedJoined} label="Completed" icon="completed" />
    </div>
  );
}

interface StatItemProps {
  value: number;
  label: string;
  icon: "create" | "active" | "completed";
}

function StatItem({ value, label, icon }: StatItemProps) {
  const renderIcon = () => {
    switch (icon) {
      case "create":
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        );
      case "active":
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "completed":
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-white/40">
        {renderIcon()}
      </div>
      <span className="text-lg font-bold text-white font-mono">{value}</span>
      <span className="text-xs text-white/40 font-mono">{label}</span>
    </div>
  );
}

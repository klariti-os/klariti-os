"use client";

import React from "react";

export default function ChallengeCardSkeleton() {
  return (
    <div className="flex flex-col p-6 bg-card border border-border rounded-xl animate-pulse h-[200px]">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-14 bg-muted rounded-full"></div>
            <div className="flex -space-x-2">
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-card"></div>
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-card"></div>
            </div>
          </div>
          <div className="h-6 w-3/4 bg-muted rounded-lg"></div>
        </div>
        <div className="w-12 h-7 bg-muted rounded-full"></div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-5/6 bg-muted rounded"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded"></div>
        <div className="h-4 w-12 bg-muted rounded"></div>
      </div>
    </div>
  );
}

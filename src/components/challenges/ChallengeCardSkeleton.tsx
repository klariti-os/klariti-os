"use client";

import React from "react";

export default function ChallengeCardSkeleton() {
  return (
    <div className="flex flex-col p-5 bg-[#18181B]/60 backdrop-blur-xl border border-white/5 rounded-2xl animate-pulse h-[200px]">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-16 bg-white/10 rounded-full"></div>
            <div className="flex -space-x-2">
               <div className="h-6 w-6 rounded-full bg-white/10 border-2 border-[#18181B]"></div>
               <div className="h-6 w-6 rounded-full bg-white/10 border-2 border-[#18181B]"></div>
            </div>
          </div>
          <div className="h-6 w-3/4 bg-white/10 rounded"></div>
        </div>
        <div className="w-12 h-6 bg-white/10 rounded"></div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-white/10 rounded"></div>
        <div className="h-4 w-5/6 bg-white/10 rounded"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="h-4 w-20 bg-white/10 rounded"></div>
        <div className="h-4 w-12 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

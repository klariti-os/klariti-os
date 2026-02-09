"use client";

import { useQuery } from "@tanstack/react-query";
import { Challenge } from "@/services/challenges";

function TanstackDemo() {
  const { data, isPending, error } = useQuery<Challenge[]>({
    queryKey: ["challenges"],
    queryFn: async () => {
      const response = await fetch(
        "https://api-klariti.onrender.com/challenges/?skip=0&limit=100&active_only=false",
        {
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpZ25hcyIsImV4cCI6MTc3MDE3MTI1NH0.EfDJCeuVyJ-lbVwMuVhSXztllU2-4FaNYumhyJfNPa0",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-400">
        Loading challenges...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        Oops! Error: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950 p-8 pt-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-editorial text-zinc-100">
          Challenges Demo
        </h1>
        <ul className="space-y-3">
          {data?.map((challenge) => (
            <li
              key={challenge.id}
              className="p-4 bg-zinc-900/50 hover:bg-zinc-900 transition-colors rounded-xl border border-zinc-800 text-zinc-200"
            >
              {challenge.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TanstackDemo;

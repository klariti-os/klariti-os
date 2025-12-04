"use client";

import React, { useState } from "react";
import {
  createChallenge,
  ChallengeType,
  CreateChallengeData,
} from "@/services/challenges";

interface CreateChallengeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateChallengeForm({
  onSuccess,
  onCancel,
}: CreateChallengeFormProps) {
  const [formData, setFormData] = useState<CreateChallengeData>({
    name: "",
    description: "",
    challenge_type: ChallengeType.TIME_BASED,
    strict_mode: false,
    start_date: "",
    end_date: "",
    is_active: true,
    distractions: [],
  });

  const [timeMode, setTimeMode] = useState<"duration" | "dates">("duration");
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 30 });
  const [websites, setWebsites] = useState<{ url: string; name?: string }[]>(
    []
  );
  const [newWebsite, setNewWebsite] = useState({ url: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const dataToSubmit: CreateChallengeData = {
        ...formData,
        distractions: websites.length > 0 ? websites : undefined,
      };

      // Handle Time Based logic
      // Handle Time Based logic
      if (formData.challenge_type === ChallengeType.TIME_BASED) {
        if (timeMode === "duration") {
          // Calculate dates based on duration from NOW
          const now = new Date();
          const end = new Date(now.getTime());
          
          // Add duration in milliseconds
          const durationMs = 
            (parseInt(duration.days.toString()) || 0) * 24 * 60 * 60 * 1000 +
            (parseInt(duration.hours.toString()) || 0) * 60 * 60 * 1000 +
            (parseInt(duration.minutes.toString()) || 0) * 60 * 1000;
            
          end.setTime(end.getTime() + durationMs);

          dataToSubmit.start_date = now.toISOString();
          dataToSubmit.end_date = end.toISOString();
        } else {
          // Custom Dates mode
          // Convert local datetime-local strings to ISO UTC strings
          if (formData.start_date) {
            dataToSubmit.start_date = new Date(formData.start_date).toISOString();
          }
          if (formData.end_date) {
            dataToSubmit.end_date = new Date(formData.end_date).toISOString();
          }
        }
      } else if (formData.challenge_type === ChallengeType.TOGGLE) {
        delete dataToSubmit.start_date;
        delete dataToSubmit.end_date;
      }

      // Cleanup
      if (formData.challenge_type !== ChallengeType.TOGGLE) {
        delete dataToSubmit.is_active;
      }

      await createChallenge(dataToSubmit);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create challenge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addWebsite = () => {
    if (newWebsite.url.trim()) {
      setWebsites([...websites, newWebsite]);
      setNewWebsite({ url: "", name: "" });
    }
  };

  const removeWebsite = (index: number) => {
    setWebsites(websites.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100/60 backdrop-blur-sm border border-red-300/40 rounded-lg text-red-800 text-sm shadow-md">
          {error}
        </div>
      )}

      {/* Challenge Name */}
      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2 font-mono">
          Challenge Name *
        </label>
        <input
          type="text"
          required
          maxLength={100}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300/40 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-transparent font-mono text-sm shadow-sm"
          placeholder="e.g., 30-Day No Social Media"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2 font-mono">
          Description
        </label>
        <textarea
          maxLength={255}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 border border-slate-300/40 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-transparent font-mono text-sm shadow-sm"
          placeholder="What is this challenge about?"
          rows={3}
        />
      </div>

      {/* Challenge Type */}
      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2 font-mono">
          Challenge Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, challenge_type: ChallengeType.TIME_BASED })
            }
            className={`p-4 border-2 rounded-lg text-left transition-all duration-300 backdrop-blur-sm shadow-sm ${
              formData.challenge_type === ChallengeType.TIME_BASED
                ? "border-slate-600/60 bg-slate-200/60"
                : "border-slate-300/40 bg-white/40 hover:border-slate-400/50"
            }`}
          >
            <div className="font-medium font-mono">Time-Based</div>
            <div className="text-sm text-slate-700 mt-1 font-mono">
              Challenge with start and end dates
            </div>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, challenge_type: ChallengeType.TOGGLE })
            }
            className={`p-4 border-2 rounded-lg text-left transition-all duration-300 backdrop-blur-sm shadow-sm ${
              formData.challenge_type === ChallengeType.TOGGLE
                ? "border-slate-600/60 bg-slate-200/60"
                : "border-slate-300/40 bg-white/40 hover:border-slate-400/50"
            }`}
          >
            <div className="font-medium font-mono">Toggle</div>
            <div className="text-sm text-slate-700 mt-1 font-mono">
              On/off challenge you can toggle anytime
            </div>
          </button>
        </div>
      </div>

      {/* Time-Based Fields */}
      {formData.challenge_type === ChallengeType.TIME_BASED && (
        <div className="space-y-4 p-4 bg-slate-100/50 rounded-lg border border-slate-200">
          {/* Mode Toggle */}
          <div className="flex p-1 bg-slate-200/50 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => setTimeMode("duration")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all font-mono ${
                timeMode === "duration"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Set Duration
            </button>
            <button
              type="button"
              onClick={() => setTimeMode("dates")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all font-mono ${
                timeMode === "dates"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Custom Dates
            </button>
          </div>

          {timeMode === "duration" ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 font-mono">
                  Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.days}
                  onChange={(e) => setDuration({ ...duration, days: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300/40 bg-white/50 rounded-lg focus:ring-2 focus:ring-slate-500/50 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 font-mono">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.hours}
                  onChange={(e) => setDuration({ ...duration, hours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300/40 bg-white/50 rounded-lg focus:ring-2 focus:ring-slate-500/50 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 font-mono">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.minutes}
                  onChange={(e) => setDuration({ ...duration, minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300/40 bg-white/50 rounded-lg focus:ring-2 focus:ring-slate-500/50 font-mono text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2 font-mono">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  required={timeMode === "dates"}
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300/40 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-transparent font-mono text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2 font-mono">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  required={timeMode === "dates"}
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300/40 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-transparent font-mono text-sm shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Strict Mode */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="strict_mode"
          checked={formData.strict_mode}
          onChange={(e) =>
            setFormData({ ...formData, strict_mode: e.target.checked })
          }
          className="mt-1 h-4 w-4 text-slate-600 rounded border-slate-300 focus:ring-slate-500"
        />
        <label htmlFor="strict_mode" className="ml-3">
          <div className="text-sm font-medium text-slate-800 font-mono">Strict Mode</div>
          <div className="text-sm text-slate-700 font-mono">
            Enable stricter tracking and enforcement of the challenge
          </div>
        </label>
      </div>

      {/* Distracting Websites */}
      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2 font-mono">
          Distracting Websites
        </label>
        <div className="space-y-2">
          {websites.map((site, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-slate-100/60 backdrop-blur-sm rounded-lg border border-slate-300/30 shadow-sm"
            >
              <div className="flex-1">
                <div className="font-mono text-sm text-slate-800">{site.url}</div>
                {site.name && (
                  <div className="text-xs text-slate-600 font-mono">{site.name}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeWebsite(index)}
                className="px-3 py-1 text-sm text-red-700 hover:bg-red-100/60 rounded font-mono transition-colors backdrop-blur-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="url"
            value={newWebsite.url}
            onChange={(e) =>
              setNewWebsite({ ...newWebsite, url: e.target.value })
            }
            placeholder="https://example.com"
            className="flex-1 px-4 py-2 border border-slate-300/40 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-transparent font-mono text-sm shadow-sm"
          />
          <input
            type="text"
            value={newWebsite.name}
            onChange={(e) =>
              setNewWebsite({ ...newWebsite, name: e.target.value })
            }
            placeholder="Name (optional)"
            className="w-40 px-4 py-2 border border-slate-300/40 bg-white/50 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-transparent font-mono text-sm shadow-sm"
          />
          <button
            type="button"
            onClick={addWebsite}
            className="px-4 py-2 bg-slate-200/60 hover:bg-slate-300/60 backdrop-blur-sm rounded-lg transition-all duration-300 font-mono text-sm shadow-sm border border-slate-300/30"
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-slate-700/60 hover:bg-slate-800/60 disabled:bg-slate-400/60 backdrop-blur-sm text-white font-medium rounded-lg transition-all duration-300 shadow-md border border-white/20 font-mono"
        >
          {isSubmitting ? "Creating..." : "Create Challenge"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-200/60 hover:bg-slate-300/60 backdrop-blur-sm text-slate-800 font-medium rounded-lg transition-all duration-300 shadow-sm border border-slate-300/30 font-mono"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

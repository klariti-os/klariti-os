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
  isOpen?: boolean;
}

export default function CreateChallengeForm({
  onSuccess,
  onCancel,
  isOpen = true,
}: CreateChallengeFormProps) {
  // Get current date and time for defaults
  const now = new Date();
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const getLocalTimeString = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

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

  const [startDate, setStartDate] = useState(getLocalDateString(now));
  const [startTime, setStartTime] = useState(getLocalTimeString(now));
  const [endDate, setEndDate] = useState(getLocalDateString(now));
  const [endTime, setEndTime] = useState(getLocalTimeString(now));

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
          // Combine date and time, convert to ISO UTC strings
          if (startDate && startTime) {
            dataToSubmit.start_date = new Date(`${startDate}T${startTime}`).toISOString();
          }
          if (endDate && endTime) {
            dataToSubmit.end_date = new Date(`${endDate}T${endTime}`).toISOString();
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

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg text-red-400 text-sm shadow-md">
          {error}
        </div>
      )}

      {/* Challenge Name */}
      <div>
        <input
          type="text"
          required
          maxLength={100}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent font-mono text-sm text-white placeholder-white/40"
          placeholder="Type the challenge name i.e break from tiktok"
        />
      </div>

      {/* Description */}
      <div>
        <textarea
          maxLength={255}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-3 py-2 border border-[#3F3F46] bg-[#27272A] rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent font-mono text-sm text-white placeholder-white/40"
          placeholder="Add some notes/description about this challenge"
          rows={2}
        />
      </div>

      {/* Challenge Type */}
      <div>
        <label className="block text-xs font-medium text-white/90 mb-1.5 font-mono">
          Challenge Type *
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, challenge_type: ChallengeType.TIME_BASED })
            }
            className={`p-3 border rounded-lg text-left transition-all duration-300 ${
              formData.challenge_type === ChallengeType.TIME_BASED
                ? "border-green-500/40 bg-green-500/10 text-white"
                : "border-[#3F3F46] bg-[#27272A] text-white/70 hover:border-[#3F3F46] hover:bg-[#27272A]/70"
            }`}
          >
            <div className="font-medium font-mono text-sm">Time-Based</div>
            <div className="text-xs text-white/60 mt-0.5 font-mono">
              Start & end dates
            </div>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, challenge_type: ChallengeType.TOGGLE })
            }
            className={`p-3 border rounded-lg text-left transition-all duration-300 ${
              formData.challenge_type === ChallengeType.TOGGLE
                ? "border-green-500/40 bg-green-500/10 text-white"
                : "border-[#3F3F46] bg-[#27272A] text-white/70 hover:border-[#3F3F46] hover:bg-[#27272A]/70"
            }`}
          >
            <div className="font-medium font-mono text-sm">Toggle</div>
            <div className="text-xs text-white/60 mt-0.5 font-mono">
              On/off anytime
            </div>
          </button>
        </div>
      </div>

      {/* Time-Based Fields */}
      {formData.challenge_type === ChallengeType.TIME_BASED && (
        <div className="space-y-3 p-3 bg-[#27272A]/50 rounded-lg border border-[#27272A]">
          {/* Mode Toggle */}
          <div className="flex p-1 bg-[#18181B]/50 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setTimeMode("duration")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all font-mono ${
                timeMode === "duration"
                  ? "bg-green-500/20 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Set Duration
            </button>
            <button
              type="button"
              onClick={() => setTimeMode("dates")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all font-mono ${
                timeMode === "dates"
                  ? "bg-green-500/20 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Custom Dates
            </button>
          </div>

          {timeMode === "duration" ? (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1 font-mono">
                  Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.days}
                  onChange={(e) => setDuration({ ...duration, days: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-[#3F3F46] bg-[#18181B] rounded-lg focus:ring-2 focus:ring-green-500/50 font-mono text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1 font-mono">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.hours}
                  onChange={(e) => setDuration({ ...duration, hours: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-[#3F3F46] bg-[#18181B] rounded-lg focus:ring-2 focus:ring-green-500/50 font-mono text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1 font-mono">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.minutes}
                  onChange={(e) => setDuration({ ...duration, minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-[#3F3F46] bg-[#18181B] rounded-lg focus:ring-2 focus:ring-green-500/50 font-mono text-sm text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Start Date & Time */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2 font-mono">Start Date</label>
                <div className="space-y-2">
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                    </svg>
                    <input
                      type="date"
                      required={timeMode === "dates"}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 pl-10 border border-[#3F3F46] bg-[#18181B] rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent font-mono text-sm text-white [color-scheme:dark]"
                    />
                  </div>
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <input
                      type="time"
                      required={timeMode === "dates"}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2.5 pl-10 border border-[#3F3F46] bg-[#18181B] rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent font-mono text-sm text-white [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2 font-mono">End Date</label>
                <div className="space-y-2">
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                    </svg>
                    <input
                      type="date"
                      required={timeMode === "dates"}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 pl-10 border border-[#3F3F46] bg-[#18181B] rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent font-mono text-sm text-white [color-scheme:dark]"
                    />
                  </div>
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <input
                      type="time"
                      required={timeMode === "dates"}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2.5 pl-10 border border-[#3F3F46] bg-[#18181B] rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent font-mono text-sm text-white [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Strict Mode */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="strict_mode"
          checked={formData.strict_mode}
          onChange={(e) =>
            setFormData({ ...formData, strict_mode: e.target.checked })
          }
          className="h-4 w-4 text-green-500 rounded border-[#3F3F46] bg-[#27272A] focus:ring-green-500/50"
        />
        <label htmlFor="strict_mode" className="text-xs font-medium text-white/90 font-mono">
          Strict Mode
        </label>
      </div>

      {/* Distracting Websites */}
      <div>
        <label className="block text-xs font-medium text-white/90 mb-1.5 font-mono">
          Distracting Websites
        </label>
        <div className="space-y-1.5 max-h-24 overflow-y-auto">
          {websites.map((site, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-[#27272A] rounded border border-[#3F3F46]"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-white truncate">{site.url}</div>
              </div>
              <button
                type="button"
                onClick={() => removeWebsite(index)}
                className="px-2 py-0.5 text-xs text-red-400 hover:bg-red-500/10 rounded font-mono transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={newWebsite.url}
            onChange={(e) =>
              setNewWebsite({ ...newWebsite, url: e.target.value })
            }
            placeholder="https://example.com"
            className="flex-1 px-3 py-1.5 border border-[#3F3F46] bg-[#27272A] rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent font-mono text-xs text-white placeholder-white/40"
          />
          <button
            type="button"
            onClick={addWebsite}
            className="px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] rounded-lg transition-all duration-300 font-mono text-xs text-white border border-[#3F3F46]"
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-green-600/80 hover:bg-green-700/80 disabled:bg-green-600/40 backdrop-blur-sm text-white font-medium rounded-lg transition-all duration-300 shadow-md border border-white/20 font-mono text-sm"
        >
          {isSubmitting ? "Creating..." : "Create"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white font-medium rounded-lg transition-all duration-300 border border-[#3F3F46] font-mono text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

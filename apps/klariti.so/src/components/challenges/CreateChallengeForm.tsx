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
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const getLocalTimeString = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
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
    [],
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

      if (formData.challenge_type === ChallengeType.TIME_BASED) {
        if (timeMode === "duration") {
          const now = new Date();
          const end = new Date(now.getTime());

          const durationMs =
            (parseInt(duration.days.toString()) || 0) * 24 * 60 * 60 * 1000 +
            (parseInt(duration.hours.toString()) || 0) * 60 * 60 * 1000 +
            (parseInt(duration.minutes.toString()) || 0) * 60 * 1000;

          end.setTime(end.getTime() + durationMs);

          dataToSubmit.start_date = now.toISOString();
          dataToSubmit.end_date = end.toISOString();
        } else {
          if (startDate && startTime) {
            dataToSubmit.start_date = new Date(
              `${startDate}T${startTime}`,
            ).toISOString();
          }
          if (endDate && endTime) {
            dataToSubmit.end_date = new Date(
              `${endDate}T${endTime}`,
            ).toISOString();
          }
        }
      } else if (formData.challenge_type === ChallengeType.TOGGLE) {
        delete dataToSubmit.start_date;
        delete dataToSubmit.end_date;
      }

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-mono">
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
          className="focus-ring w-full px-4 py-3 border border-border bg-muted rounded-xl text-foreground placeholder-muted-foreground font-mono text-sm"
          placeholder="Challenge name (e.g., Break from TikTok)"
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
          className="focus-ring w-full px-4 py-3 border border-border bg-muted rounded-xl text-foreground placeholder-muted-foreground font-mono text-sm resize-none"
          placeholder="Add some notes about this challenge..."
          rows={2}
        />
      </div>

      {/* Challenge Type */}
      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
          Challenge Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                challenge_type: ChallengeType.TIME_BASED,
              })
            }
            className={`focus-ring p-4 border rounded-xl text-left transition-all duration-200 ${
              formData.challenge_type === ChallengeType.TIME_BASED
                ? "border-foreground bg-muted text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="font-mono text-sm font-medium">Time-Based</div>
            <div className="text-xs text-muted-foreground mt-1">
              Start & end dates
            </div>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, challenge_type: ChallengeType.TOGGLE })
            }
            className={`focus-ring p-4 border rounded-xl text-left transition-all duration-200 ${
              formData.challenge_type === ChallengeType.TOGGLE
                ? "border-foreground bg-muted text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="font-mono text-sm font-medium">Toggle</div>
            <div className="text-xs text-muted-foreground mt-1">
              On/off anytime
            </div>
          </button>
        </div>
      </div>

      {/* Time-Based Fields */}
      {formData.challenge_type === ChallengeType.TIME_BASED && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-border">
          {/* Mode Toggle */}
          <div className="flex p-1 bg-card rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setTimeMode("duration")}
              className={`flex-1 py-2 text-xs font-mono rounded-md transition-all ${
                timeMode === "duration"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Set Duration
            </button>
            <button
              type="button"
              onClick={() => setTimeMode("dates")}
              className={`flex-1 py-2 text-xs font-mono rounded-md transition-all ${
                timeMode === "dates"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom Dates
            </button>
          </div>

          {timeMode === "duration" ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                  Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.days}
                  onChange={(e) =>
                    setDuration({
                      ...duration,
                      days: parseInt(e.target.value) || 0,
                    })
                  }
                  className="focus-ring w-full px-3 py-2 border border-border bg-card rounded-lg font-mono text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.hours}
                  onChange={(e) =>
                    setDuration({
                      ...duration,
                      hours: parseInt(e.target.value) || 0,
                    })
                  }
                  className="focus-ring w-full px-3 py-2 border border-border bg-card rounded-lg font-mono text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration.minutes}
                  onChange={(e) =>
                    setDuration({
                      ...duration,
                      minutes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="focus-ring w-full px-3 py-2 border border-border bg-card rounded-lg font-mono text-sm text-foreground"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Start Date & Time */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">
                  Start Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                        strokeWidth="2"
                      />
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                    </svg>
                    <input
                      type="date"
                      required={timeMode === "dates"}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="focus-ring w-full px-3 py-2.5 pl-10 border border-border bg-card rounded-lg font-mono text-sm text-foreground"
                    />
                  </div>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <input
                      type="time"
                      required={timeMode === "dates"}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="focus-ring w-full px-3 py-2.5 pl-10 border border-border bg-card rounded-lg font-mono text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">
                  End Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                        strokeWidth="2"
                      />
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                    </svg>
                    <input
                      type="date"
                      required={timeMode === "dates"}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="focus-ring w-full px-3 py-2.5 pl-10 border border-border bg-card rounded-lg font-mono text-sm text-foreground"
                    />
                  </div>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <input
                      type="time"
                      required={timeMode === "dates"}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="focus-ring w-full px-3 py-2.5 pl-10 border border-border bg-card rounded-lg font-mono text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Strict Mode */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            formData.strict_mode
              ? "bg-primary border-primary"
              : "border-border group-hover:border-muted-foreground"
          }`}
        >
          {formData.strict_mode && (
            <svg
              className="w-3 h-3 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <span className="text-sm font-mono text-muted-foreground group-hover:text-foreground">
          Strict Mode
        </span>
        <input
          type="checkbox"
          className="hidden"
          checked={formData.strict_mode}
          onChange={(e) =>
            setFormData({ ...formData, strict_mode: e.target.checked })
          }
        />
      </label>

      {/* Distracting Websites */}
      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
          Distracting Websites
        </label>
        <div className="space-y-2 max-h-28 overflow-y-auto">
          {websites.map((site, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-foreground truncate">
                  {site.url}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeWebsite(index)}
                className="focus-ring p-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg font-mono transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
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
            className="focus-ring flex-1 px-3 py-2 border border-border bg-card rounded-lg font-mono text-xs text-foreground placeholder-muted-foreground"
          />
          <button
            type="button"
            onClick={addWebsite}
            className="focus-ring px-4 py-2 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors font-mono text-xs border border-border"
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring flex-1 px-6 py-3 bg-primary text-primary-foreground disabled:opacity-50 font-mono text-sm rounded-full transition-opacity hover:opacity-80"
        >
          {isSubmitting ? "Creating..." : "Create Challenge"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="focus-ring px-6 py-3 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-colors border border-border font-mono text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { NextPage } from "next";

const metrics = [
  { label: "Focus Streak", value: "18 days", delta: "+3 this week" },
  { label: "Sessions Completed", value: "126", delta: "+12 today" },
  { label: "Distraction Blocks", value: "342", delta: "87% success rate" },
  { label: "Recovery Score", value: "8.4 / 10", delta: "+0.6 vs last month" },
];

const wellnessMix = [
  { label: "Deep Work", percent: 42 },
  { label: "No-Phone Blocks", percent: 26 },
  { label: "Mindful Breaks", percent: 18 },
  { label: "Night Wind-Down", percent: 14 },
];

const activity = [
  { day: "Mon", value: 3 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 6 },
  { day: "Thu", value: 4 },
  { day: "Fri", value: 7 },
  { day: "Sat", value: 2 },
  { day: "Sun", value: 5 },
];

const queue = [
  { name: "Social Media Lite", status: "In progress", due: "Mar 7" },
  { name: "Night Scroll Reset", status: "Scheduled", due: "Mar 10" },
  { name: "Email Windowing", status: "Draft", due: "Mar 12" },
  { name: "Weekend Digital Sabbath", status: "Ready", due: "Mar 16" },
];

const feed = [
  "Completed a 90-minute deep work session without interruptions.",
  "Blocked 12 distracting app launches during your focus window.",
  "Slept on schedule 3 nights in a row after evening lock mode.",
  "Saved 2h 14m of potential distraction time this week.",
];

const DashboardPage: NextPage = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-content px-6 pb-32 pt-32">
        <header className="mb-12">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Dashboard
          </p>
          <h1
            className="mb-2 font-serif text-3xl font-light tracking-tight text-foreground"
            style={{ textWrap: "balance" }}
          >
            Welcome back{user ? `, ${user.name}` : ""}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Manage your focus challenges and track your digital wellness
            progress.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Filters
            </span>
            {["Today", "This week", "Last 30 days", "All challenge types"].map(
              (filter, index) => (
                <button
                  key={filter}
                  type="button"
                  className={`focus-ring rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                    index === 1
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ),
            )}
          </div>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </p>
              <p className="mb-1 font-serif text-3xl text-foreground">
                {metric.value}
              </p>
              <p className="text-xs text-[var(--success)]">{metric.delta}</p>
            </article>
          ))}
        </section>

        <section className="mb-10 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-xl text-foreground">
                Weekly Focus Activity
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Placeholder analytics
              </span>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {activity.map((point) => (
                <div key={point.day} className="flex flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end rounded-xl bg-[var(--muted)] p-2">
                    <div
                      className="w-full rounded-md bg-foreground/80"
                      style={{ height: `${point.value * 14}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    {point.day}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-5 font-serif text-xl text-foreground">
              Wellness Mix
            </h2>
            <div className="space-y-4">
              {wellnessMix.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {item.percent}%
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--muted)]">
                    <div
                      className="h-2 rounded-full bg-foreground/80"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
            <h2 className="mb-5 font-serif text-xl text-foreground">
              Challenge Pipeline
            </h2>
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-foreground">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {item.status}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Due {item.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <h2 className="mb-5 font-serif text-xl text-foreground">Live Feed</h2>
            <ul className="space-y-3">
              {feed.map((item) => (
                <li
                  key={item}
                  className="rounded-xl bg-[var(--muted)] px-4 py-3 text-sm text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;

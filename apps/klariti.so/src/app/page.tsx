import type { Metadata, NextPage } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import VideoHero from "@/components/VideoHero";

export const metadata: Metadata = {
  title: "Klariti \u2014 Reclaim Your Agency in the Digital Age",
  description:
    "An intelligent layer between you and the internet, shaped to prioritize your wellbeing over engagement. Not blocking \u2014 shaping.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const capabilities = [
  {
    label: "Filtering",
    description: "Remove distracting elements from pages in real time.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
  },
  {
    label: "Delaying",
    description: "Introduce friction for impulsive behavior patterns.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Reframing",
    description: "Present content in less addictive formats.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    label: "Rerouting",
    description: "Redirect attention to more intentional alternatives.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Challenges System",
    description:
      "Time-based and toggle challenges that help you build healthier digital habits through intentional friction.",
    icon: (
      <svg className="h-[18px] w-[18px] text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    mockup: "challenges" as const,
  },
  {
    title: "Progress Insights",
    description:
      "Understand your digital patterns with clear analytics. No dark patterns\u2014just honest data about your habits.",
    icon: (
      <svg className="h-[18px] w-[18px] text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    mockup: "insights" as const,
  },
];

const smallFeatures = [
  {
    title: "Community Hub",
    description: "Browse, join, and create challenges with others pursuing digital wellbeing.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Context-Aware",
    description: "The same platform can support learning or undermine focus. Klariti understands the difference.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Shaping",
    description: "Sub-100ms content decisions. Fast enough that you never notice the intervention.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Cross-Platform",
    description: "Browser extension, mobile, desktop\u2014one unified ecosystem for your digital wellbeing.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const foundations = [
  {
    title: "Sub-100ms Decisions",
    description: "Built with a high-performance architecture. Content shaping happens in real time, faster than you can perceive.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    title: "Privacy by Default",
    description: "All processing happens locally. Your browsing data never leaves your device. Zero tracking, zero telemetry.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Research-Backed",
    description: "Grounded in neuroscience research on digital addiction. Studying brain activity linked to addictive platform interactions.",
    icon: (
      <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Mockup sub-components                                              */
/* ------------------------------------------------------------------ */

function ChallengesMockup() {
  const challenges = [
    { name: "No Reels for 7 days", progress: 71 },
    { name: "2hr daily screen limit", progress: 45 },
    { name: "No doom scrolling", progress: 100 },
  ];

  return (
    <div className="flex flex-col gap-3">
      {challenges.map((c) => (
        <div key={c.name}>
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-xs text-foreground">{c.name}</span>
            <span className="font-mono text-xs text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
              {c.progress}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/20 transition-all"
              style={{ width: `${c.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsMockup() {
  const bars = [35, 55, 40, 70, 85, 45, 30];
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
          3.2h
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          &minus;24% vs last week
        </span>
      </div>
      <div className="flex items-end gap-2">
        {bars.map((h, i) => (
          <div key={days[i]} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full rounded-sm bg-muted" style={{ height: `${h}px` }}>
              <div className="w-full rounded-sm bg-foreground/15 transition-all" style={{ height: `${h * 0.6}px` }} />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const HomePage: NextPage = () => {
  return (
    <>
      <main className="overflow-x-hidden">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <VideoHero src="https://aho0m5pvydzzhrre.public.blob.vercel-storage.com/klariti-melancholy%20mp4.mp4" poster="/images/hero-placehorder.png">
          <div className="mx-auto max-w-content px-6 text-center">
           

            <h1
              className="animate-fade-in-up font-serif text-4xl leading-tight tracking-tight text-white md:text-6xl"
              style={{ textWrap: "balance" }}
            >
              Reclaim your agency{" "}
              <em className="text-white/70">in the digital age</em>
            </h1>

            <p
              className="animate-fade-in-up mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/80"
              style={{ textWrap: "pretty" }}
            >
              An intelligent layer between you and the internet, shaped to
              prioritize your wellbeing over engagement. Not blocking
              &mdash;&nbsp;shaping.
            </p>

            <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="focus-ring group inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                Get started
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/manifesto"
                className="focus-ring inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Read the manifesto
              </Link>
            </div>

            <p className="mt-20 font-mono text-xs uppercase tracking-widest text-white/40">
              Technology should serve people, not exploit them
            </p>
          </div>
        </VideoHero>

        <div className="screen-line-after mx-auto max-w-content" />

        {/* ── Gray Engine ─────────────────────────────────────────── */}
        <section id="product" className="py-20 md:py-32">
          <div className="mx-auto max-w-content px-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              The Gray Engine
            </p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl" style={{ textWrap: "balance" }}>
              Not blocking the internet.{" "}
              <em className="text-muted-foreground">Shaping it intelligently.</em>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
              A selective, context-aware decision system that understands content
              exists on a spectrum&mdash;not as binary good or bad.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {capabilities.map((cap) => (
                <div key={cap.label} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">{cap.icon}</div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{cap.label}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{cap.description}</p>
                </div>
              ))}
            </div>

            {/* Browser mockup */}
            <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                </div>
                <div className="flex-1 rounded-md bg-muted px-4 py-1 text-center">
                  <span className="font-mono text-[11px] text-muted-foreground">instagram.com/explore</span>
                </div>
              </div>
              <div className="px-6 py-10 md:py-14">
                <div className="mx-auto max-w-sm text-center">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-foreground/40" />
                    <span className="font-mono text-xs font-medium text-foreground">Gray Engine Active</span>
                  </div>
                  <p className="text-lg font-medium text-foreground">Explore page reshaped</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Infinite scroll disabled. Algorithmic recommendations hidden.
                    Showing only content from accounts you follow.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <span className="rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-foreground">Keep shaping</span>
                    <span className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground">Override for 15&nbsp;min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="screen-line-after mx-auto max-w-content" />

        {/* ── Features ────────────────────────────────────────────── */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-content px-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Platform</p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl" style={{ textWrap: "balance" }}>
              Purpose-built for{" "}
              <em className="text-muted-foreground">digital wellbeing</em>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
              Every feature is designed around one principle: technology should serve people, not exploit them.
            </p>

            <div className="mt-12 flex flex-col gap-4">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{feature.icon}</div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  <div className="mt-6 rounded-lg border border-border bg-background p-4">
                    {feature.mockup === "challenges" ? <ChallengesMockup /> : <InsightsMockup />}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {smallFeatures.map((feature) => (
                <article key={feature.title} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-muted-foreground/30">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">{feature.icon}</div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="screen-line-after mx-auto max-w-content" />

        {/* ── Five Principles ─────────────────────────────────────── */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-content px-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Five Principles</p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl" style={{ textWrap: "balance" }}>
              Guided by{" "}
              <em className="text-muted-foreground">intention</em>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
              Everything we build is rooted in five principles for digital wellbeing.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-5">
              {[
                { word: "Focus", japanese: "集中", description: "Direct your attention with intention. Cut through the noise." },
                { word: "Balance", japanese: "調和", description: "Technology in harmony with life, not consuming it." },
                { word: "Clarity", japanese: "明晰", description: "See through the algorithmic fog. Know what matters." },
                { word: "Mindful", japanese: "気づき", description: "Present in each interaction. Conscious of every click." },
                { word: "Zen", japanese: "禅", description: "Inner peace in a world designed to disturb it." },
              ].map((value, i) => (
                <article
                  key={value.word}
                  className={`flex flex-col items-center bg-card px-4 py-8 text-center transition-colors hover:bg-muted/50 ${
                    i === 4 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <span className="mb-3 text-3xl text-muted-foreground/40 select-none">{value.japanese}</span>
                  <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-foreground">{value.word}</h3>
                  <p className="max-w-[160px] text-xs leading-relaxed text-muted-foreground">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="screen-line-after mx-auto max-w-content" />

        {/* ── Manifesto teaser ────────────────────────────────────── */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-content px-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Philosophy</p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl" style={{ textWrap: "balance" }}>
              The anti-exploitation{" "}
              <em className="text-muted-foreground">philosophy</em>
            </h2>

            <blockquote className="mt-10 rounded-xl border border-border bg-card p-8 md:p-10">
              <p className="font-serif text-xl leading-relaxed text-foreground/90 md:text-2xl">
                &ldquo;We believe that technology should serve people, not exploit
                them. We reject addictive designs and data commodification. We
                prioritize transparency, privacy, and digital well-being.&rdquo;
              </p>
              <footer className="mt-8 flex items-center gap-3 border-t border-border pt-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  <span className="font-serif text-sm text-foreground">K</span>
                </div>
                <div>
                  <cite className="not-italic text-sm font-medium text-foreground">Klariti Foundation</cite>
                  <p className="font-mono text-xs text-muted-foreground">Open source &middot; MIT licensed</p>
                </div>
              </footer>
            </blockquote>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Wellbeing-First", text: "Prioritize user health and intentionality over engagement metrics." },
                { label: "Context-Aware", text: "Understand that content value exists along a spectrum, never binary." },
                { label: "User Agency", text: "Empower users to reclaim control without disconnecting entirely." },
                { label: "Transparent AI", text: "Every decision is explainable, reversible, and user-controlled." },
              ].map((p) => (
                <article key={p.label} className="rounded-xl border border-border bg-card p-5">
                  <p className="mb-1 text-sm font-semibold text-foreground">{p.label}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/manifesto" className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 font-mono text-xs text-foreground transition-colors hover:bg-muted">
                Read the full manifesto
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <div className="screen-line-after mx-auto max-w-content" />

        {/* ── Under the Hood ──────────────────────────────────────── */}
        <section id="research" className="py-20 md:py-32">
          <div className="mx-auto max-w-content px-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Under the hood</p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl" style={{ textWrap: "balance" }}>
              Built on strong{" "}
              <em className="text-muted-foreground">foundations</em>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
              Klariti is so simple to use, it&rsquo;s easy to overlook the wealth
              of complex engineering packed under the hood.
            </p>

            <div className="mt-12 flex flex-col gap-4">
              {foundations.map((item) => (
                <article key={item.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">{item.icon}</div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>

          </div>
        </section>

        <div className="screen-line-after mx-auto max-w-content" />

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-content px-6 text-center">
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl" style={{ textWrap: "balance" }}>
              Reclaim your time.{" "}
              <em className="text-muted-foreground">Shape your internet.</em>
            </h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
              Join the movement to build technology that serves human wellbeing.
              Open source, privacy-first, community-driven.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/join"
                className="focus-ring group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get started
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href="https://discord.gg/NTKHD9pW"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex items-center rounded-full border border-border bg-transparent px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Join the Discord
              </a>
            </div>
            <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
              {["Open Source", "MIT Licensed", "Privacy-First", "Local Processing"].map((badge) => (
                <span key={badge} className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default HomePage;

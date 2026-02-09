import type { Metadata, NextPage } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Klariti — The New Standard in Digital Wellness",
  description:
    "Develop a healthy relationship with technology. Tools for focus, balance, and clarity.",
};

const HomePage: NextPage = () => {
  return (
    <>
      <main className="overflow-x-hidden">
        {/* Hero */}
        <section className="mx-auto max-w-content px-6 pb-24 pt-24 md:pt-32">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground animate-fade-in">
            Digital Wellness
          </p>
          <h1 className="mb-8 font-editorial text-4xl font-light leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl animate-fade-in-up" style={{ textWrap: "balance" }}>
            The new standard{" "}
            <br className="hidden sm:block" />
            <em className="font-extralight">in digital wellness</em>
          </h1>
          <p className="mb-10 max-w-md text-base leading-relaxed text-muted-foreground animate-fade-in-up">
            We&apos;re building tools to help our generation enjoy the benefits
            of technology while fostering a balanced, healthy relationship
            with it.
          </p>
          <div className="flex items-center gap-4 animate-fade-in-up">
            <Link
              href="/auth"
              className="focus-ring rounded-full bg-primary px-6 py-2.5 font-mono text-xs text-primary-foreground transition-opacity hover:opacity-80"
            >
              Get Started
            </Link>
            <Link
              href="/manifesto"
              className="focus-ring rounded-full border border-border px-6 py-2.5 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Read Manifesto
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="screen-line-after mx-auto max-w-content" />

        {/* Pillars */}
        <section className="mx-auto max-w-content px-6 py-20">
          <p className="mb-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Built for Those Who Value Their Time
          </p>
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4 font-editorial text-2xl font-extralight tracking-tight text-muted-foreground/40 md:text-3xl">
            <span>Focus</span>
            <span>Balance</span>
            <span>Clarity</span>
            <span>Mindfulness</span>
            <span>Intention</span>
          </div>
        </section>

        {/* Divider */}
        <div className="screen-line-after mx-auto max-w-content" />

        {/* Stats */}
        <section className="mx-auto max-w-content px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div>
              <p className="mb-1 font-editorial text-5xl font-extralight tracking-tight text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                10.6&times;
              </p>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Better Focus
              </p>
            </div>
            <div>
              <p className="mb-1 font-editorial text-5xl font-extralight tracking-tight text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                37%
              </p>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Less Screen Time
              </p>
            </div>
            <div>
              <p className="mb-1 font-editorial text-5xl font-extralight tracking-tight text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                4.8&times;
              </p>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Productivity Boost
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="screen-line-after mx-auto max-w-content" />

        {/* Features */}
        <section className="mx-auto max-w-content px-6 py-20">
          <h2 className="mb-4 font-editorial text-3xl font-light leading-tight tracking-tight text-foreground md:text-4xl" style={{ textWrap: "pretty" }}>
            Designed to Improve Outcomes.{" "}
            <br className="hidden md:block" />
            Built to Scale Across Campuses.
          </h2>
          <p className="mb-16 max-w-md text-sm leading-relaxed text-muted-foreground">
            A privacy-safe attention layer for learning and wellbeing.
          </p>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border md:grid-cols-3">
            {/* Feature 1 */}
            <article className="flex flex-col bg-card p-8">
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="mb-2 font-editorial text-lg font-normal text-foreground">
                Improve Learning Outcomes
              </h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                Focus sessions and LMS-aware nudges increase time-on-task and
                participation&mdash;without locking devices.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                +18% Time-on-Task (Pilot)
              </p>
            </article>

            {/* Feature 2 */}
            <article className="flex flex-col border-x border-border bg-card p-8 max-md:border-x-0 max-md:border-y">
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mb-2 font-editorial text-lg font-normal text-foreground">
                Privacy by Design
              </h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                Local processing, least-privilege scopes, aggregate dashboards.
                FERPA/HITRUST-aligned where needed.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                Aggregate-Only &middot; No Ad-Tech
              </p>
            </article>

            {/* Feature 3 */}
            <article className="flex flex-col bg-card p-8">
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-2 font-editorial text-lg font-normal text-foreground">
                Peer Networks Amplify Results
              </h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                Focus groups, class challenges, and streaks turn healthy tech
                use into a shared norm.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                +25% Weekly Retention in Groups
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-content px-6 py-20 text-center">
          <h2 className="mb-4 font-editorial text-3xl font-light tracking-tight text-foreground" style={{ textWrap: "balance" }}>
            Ready to Reclaim Your Time?
          </h2>
          <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Join a growing community of students and educators building
            healthier relationships with technology.
          </p>
          <Link
            href="/join"
            className="focus-ring inline-block rounded-full bg-primary px-8 py-3 font-mono text-xs text-primary-foreground transition-opacity hover:opacity-80"
          >
            Join the Waitlist
          </Link>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default HomePage;

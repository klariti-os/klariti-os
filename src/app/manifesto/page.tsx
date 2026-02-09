import type { Metadata, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manifesto \u2014 Klariti",
  description:
    "Why we are building Klariti \u2014 our fight for digital wellness and human agency.",
};

const Manifesto: NextPage = () => {
  return (
    <div className="pb-32">
      {/* ── Full-width banner ────────────────────────────────────── */}
      <div className="relative mt-0 h-[40vh] w-full overflow-hidden sm:h-[50vh]">
        <Image
          src="/images/image.png"
          alt="A calm dusk sky, symbolising clarity and intention"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient overlay - fade bottom into page background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-75% to-background" />
      </div>

      <div className="mx-auto max-w-content px-6 pt-16">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Manifesto
        </p>

        <article className="space-y-6 font-serif text-xl font-light leading-relaxed text-foreground md:text-2xl">
          <p>
            Technology was supposed to be a tool to enhance our lives&mdash;to
            help us communicate with our loved ones, learn new things, and
            grow as individuals.
          </p>

          <p>
            But somewhere along the way, what was meant to empower us became
            an addictive machine optimized to keep us hooked. Our attention
            became the product, auctioned off in real-time bidding markets we
            never consented to.
          </p>

          <p>
            We&apos;ve been turned into products&mdash;data points sold to
            the highest bidder. All at the expense of our mental health, our
            relationships, and our precious time.
          </p>

          <p>
            Billions of dollars have been invested into creating the most
            sophisticated algorithmic systems to ensure we are never
            free&mdash;no matter how disciplined we are. Infinite scrolls,
            autoplay, notification badges, streak mechanics&mdash;each
            designed by teams of brilliant engineers working against your
            best interests.
          </p>

          <p>
            Just quitting digital tools is almost impossible since they have
            become an essential part of our lives. Work, education,
            community&mdash;they all live online now. Disconnecting is not
            the answer; it never was.
          </p>

          <p className="border-l-2 border-foreground pl-6">
            <em>This is our attempt to fight back.</em>
          </p>

          <p>
            We believe in a different approach. Not blocking the internet,
            but shaping it. An intelligent layer that sits between you and
            the web, that understands content exists on a spectrum and makes
            real-time decisions to protect your attention.
          </p>

          <p>
            We call it the Gray Engine&mdash;because the world isn&apos;t
            black and white, and the tools that protect us shouldn&apos;t
            pretend it is.
          </p>
        </article>

        {/* ── Principles ─────────────────────────────────────────── */}
        <div className="screen-line-after mt-16" />

        <div className="pt-16">
          <p className="mb-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Our Principles
          </p>

          <div className="space-y-8">
            {[
              {
                num: "01",
                title: "Wellbeing Over Engagement",
                text: "Every design decision we make prioritizes your mental health over time spent on screen. We reject dark patterns, addictive loops, and any mechanism that trades your wellbeing for metrics.",
              },
              {
                num: "02",
                title: "Transparency Always",
                text: "Every decision our system makes is explainable. You can see why something was filtered, delayed, or reframed. No hidden algorithms, no opaque models\u2014full visibility into how Klariti works on your behalf.",
              },
              {
                num: "03",
                title: "Agency, Not Restriction",
                text: "We never take away your ability to choose. Klariti nudges, shapes, and suggests\u2014but you always have the final word. One click to override any decision, always.",
              },
              {
                num: "04",
                title: "Privacy Is Non-Negotiable",
                text: "All processing happens locally on your device. We never see your browsing data, never sell it, never store it. Zero tracking, zero telemetry, zero compromise.",
              },
              {
                num: "05",
                title: "Open By Default",
                text: "Klariti is and will always be open source. MIT licensed. We believe the tools that protect human agency must be owned by the community, not a corporation.",
              },
            ].map((p) => (
              <div key={p.num} className="flex gap-6">
                <span className="flex-shrink-0 font-mono text-sm text-muted-foreground/50">
                  {p.num}
                </span>
                <div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {p.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Vision ─────────────────────────────────────────────── */}
        <div className="screen-line-after mt-16" />

        <div className="pt-16">
          <article className="space-y-6 font-serif text-xl font-light leading-relaxed text-foreground md:text-2xl">
            <p>
              We envision a world where technology amplifies human
              potential instead of diminishing it. Where scrolling through
              your phone leaves you informed and connected, not anxious and empty.
            </p>

            <p>
              Where the platforms we use every day respect us as people,
              not as attention to be harvested. This isn&apos;t a utopian
              dream&mdash;it&apos;s a design choice. And we&apos;re making it.
            </p>

            <p className="border-l-2 border-foreground pl-6">
              <em>
                We are building a suite of tools that empower our generation
                to enjoy technology&apos;s benefits while fostering a healthy
                relationship with it. Not someday. Now.
              </em>
            </p>
          </article>
        </div>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <div className="mt-16 flex flex-wrap gap-4">
          <Link
            href="/join"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-mono text-xs text-primary-foreground transition-opacity hover:opacity-80"
          >
            Join the movement
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
          <a
            href="https://github.com/klariti-os"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center rounded-full border border-border px-6 py-2.5 font-mono text-xs text-foreground transition-colors hover:bg-muted"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default Manifesto;

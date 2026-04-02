import type { Metadata, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Klariti \u2014 Reclaim Your Agency in the Digital Age",
  description:
    "An intelligent layer between you and the internet, shaped to prioritize your wellbeing over engagement. Not blocking \u2014 shaping.",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const featureGallery = [
  {
    id: "01",
    image: "/images/euphoria/010.png",
    title: "Adaptive Feed Shaping",
    text: "Filters noisy patterns in real time while preserving the context you actually came for.",
  },
  {
    id: "05",
    image: "/images/euphoria/011.png",
    title: "Peer accountability",
    text: "Pair up with trusted friends, share challenge progress, and stay consistent through gentle social commitment.",
  },
  {
    id: "03",
    image: "/images/euphoria/003.png",
    title: "Progress Visibility",
    text: "Turns behavior into clear weekly signals with trend summaries and honest baselines.",
  },
  {
    id: "04",
    image: "/images/euphoria/004.png",
    title: "Cross-Platform Consistency",
    text: "Keeps your boundaries aligned across browser and mobile with one coherent rule set.",
  }
];

const HomePage: NextPage = () => {
  return (
    <div className="overflow-x-hidden">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="relative h-[100svh] overflow-hidden rounded-3xl border-8 border-white">
          <Image
            src="/images/euphoria/016.png"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1480px] items-center justify-center px-6 py-10 text-center sm:px-8 sm:py-12 md:px-10 md:py-16 lg:px-12">
            <div className="flex w-full max-w-3xl flex-col items-center">
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
                The intelligent digital well-being layer
              </p>

              <div className="animate-fade-in-up mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:mt-10">
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
                  Learn More
                </Link>
              </div>

              <p className="mt-12 font-mono text-xs uppercase tracking-widest text-white/40 md:mt-16">
                Technology should serve people, not exploit them
              </p>
            </div>
          </div>
        </section>

        {/* ── Feature Gallery ────────────────────────────────────── */}
        <section className="py-20 md:py-32">
          <div className="mx-auto w-full max-w-[1480px] px-6 sm:px-8 md:px-10 lg:px-12">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">System Features</p>
            <h2 className="max-w-3xl font-serif text-3xl tracking-tight text-foreground md:text-4xl" style={{ textWrap: "balance" }}>
              A clearer stack for
              {" "}
              <em className="text-muted-foreground">digital self-direction</em>
            </h2>

            <div className="mt-12 space-y-10 md:space-y-16">
              {featureGallery.map((item, idx) => {
                const imageLeft = idx % 2 === 0;
                return (
                  <article key={item.id} className="group rounded-xl border border-border bg-card p-4 md:p-6">
                    <div className={`flex flex-col gap-6 ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"} md:items-center md:gap-8`}>
                      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-background md:w-3/5">
                        <div className="relative aspect-[16/10]">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 768px) 100vw, 60vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                        </div>
                      </div>

                      <div className="w-full md:w-2/5">
                        <h3 className="mt-3 text-2xl leading-tight tracking-tight text-foreground">{item.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

    </div>
  );
};

export default HomePage;

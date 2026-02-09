import type { Metadata, NextPage } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Why we are building Klariti — our fight for digital wellness.",
};

const Manifesto: NextPage = () => {
  return (
    <div className="mx-auto max-w-content px-6 pb-32 pt-12">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Manifesto
      </p>

      <article className="space-y-6 font-editorial text-xl font-light leading-relaxed text-foreground md:text-2xl">
        <p>
          Technology was supposed to be a tool to enhance our lives&mdash;to
          help us communicate with our loved ones, learn new things, and grow
          as individuals.
        </p>

        <p>
          But somewhere along the way, what was meant to empower us became an
          addictive machine optimized to keep us hooked.
        </p>

        <p>
          We&apos;ve been turned into products&mdash;data points sold to the
          highest bidder. All at the expense of our mental health and our
          precious time.
        </p>

        <p>
          Billions of dollars have been invested into creating the most
          sophisticated algorithmic systems to ensure we are never
          free&mdash;no matter how disciplined we are.
        </p>

        <p>
          Just quitting digital tools is almost impossible since they have
          become an essential part of our lives.
        </p>

        <p className="border-l-2 border-foreground pl-6">
          <em>This is our attempt to fight back.</em>
        </p>

        <p>
          We are building a suite of tools that empower our generation to
          enjoy technology&apos;s benefits while fostering a healthy
          relationship with it.
        </p>
      </article>

      <div className="mt-12">
        <Link
          href="/join"
          className="focus-ring inline-block rounded-full bg-primary px-6 py-2.5 font-mono text-xs text-primary-foreground transition-opacity hover:opacity-80"
        >
          Join Us
        </Link>
      </div>
    </div>
  );
};

export default Manifesto;

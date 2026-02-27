import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="mx-auto max-w-content text-center">
        {/* 404 number */}
        <div className="mb-8 select-none">
          <span className="text-[10rem] font-serif font-semibold leading-none text-foreground/[0.06] md:text-[14rem]">
            404
          </span>
        </div>

        {/* Heading */}
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Lost in the noise
        </p>
        <h1
          className="font-serif text-3xl tracking-tight text-foreground md:text-4xl"
          style={{ textWrap: "balance" }}
        >
          This page doesn&rsquo;t exist{" "}
          <em className="text-muted-foreground">yet</em>
        </h1>
        <p
          className="mx-auto mt-4 max-w-sm leading-relaxed text-muted-foreground"
          style={{ textWrap: "pretty" }}
        >
          Like the space between thoughts, this page exists in emptiness.
          Let&rsquo;s guide you back to clarity.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="focus-ring group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Return home
          </Link>
          <Link
            href="/manifesto"
            className="focus-ring inline-flex items-center rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Read the manifesto
          </Link>
        </div>

        {/* Zen quote */}
        <div className="mx-auto mt-16 max-w-xs border-t border-border pt-8">
          <p className="font-serif text-sm italic leading-relaxed text-muted-foreground">
            &ldquo;In the beginner&rsquo;s mind there are many possibilities,
            but in the expert&rsquo;s there are few.&rdquo;
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            — Shunryu Suzuki
          </p>
        </div>
      </div>
    </main>
  );
}

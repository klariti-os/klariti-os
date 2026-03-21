import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicTagDetails } from "@/services/tags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Klariti Tag",
  description: "Public Klariti tag details.",
};

type TagPageProps = {
  params: {
    message: string;
  };
};

export default async function TagPage({ params }: TagPageProps) {
  const tag = await getPublicTagDetails(params.message);

  if (!tag) {
    notFound();
  }

  const ownerValue = tag.ownerName ?? "Unassigned";
  const ownerKicker =  "Owned by";
  const ownerNote = tag.ownerName
    ? "This Klariti tag is currently linked to a person."
    : "This Klariti tag is registered and waiting to be assigned.";
  const statusLabel = tag.status === "revoked" ? "Revoked" : "Active";
  const statusNote = tag.status === "revoked"
    ? "This tag has been retired and should no longer be used for active Klariti flows."
    : "This tag is currently active and can be used with the Klariti app.";

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28 md:pb-28 md:pt-32">
      <div
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(26,26,26,0.08),_transparent_45%),linear-gradient(180deg,_rgba(240,239,235,0.75),_rgba(250,250,248,1)_55%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-16 -z-10 mx-auto h-64 w-[min(42rem,92vw)] rounded-full bg-[rgba(74,103,65,0.10)] blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-4xl items-center">
        <div className="w-full rounded-[2rem] border border-border/70 bg-card/85 p-8 shadow-[0_24px_80px_rgba(26,26,26,0.08)] backdrop-blur md:p-12">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            Klariti KTag
          </p>
          <h1
            className="max-w-2xl font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl"
            style={{ textWrap: "balance" }}
          >
            {tag.tagName}
          </h1>
          <p
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
            style={{ textWrap: "pretty" }}
          >
            This NFC tag is registered with Klariti. Download the Klariti app and start using
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {ownerKicker}
              </p>
              <p className="mt-3 font-serif text-2xl text-foreground">
                {ownerValue}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {ownerNote}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Status
              </p>
              <p className="mt-3 font-serif text-2xl text-foreground">
                {statusLabel}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {statusNote}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open Klariti
            </Link>
            <Link
              href="/manifesto"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Learn how Klariti works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

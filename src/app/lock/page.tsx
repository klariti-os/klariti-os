import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Focus Mode Active",
  description: "Klariti focus mode is active. Time to reclaim your time.",
};

const quotes = [
  {
    text: "The key is not in spending time, but in investing it.",
    author: "Stephen R. Covey",
  },
  {
    text: "Time is the most valuable coin in your life. You and you alone will determine how that coin will be spent.",
    author: "Carl Sandburg",
  },
  {
    text: "Time is what we want most, but what we use worst.",
    author: "William Penn",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
];

export default function LockPage() {
  // Use a deterministic quote based on the day to avoid hydration mismatch
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  const quote = quotes[dayOfYear % quotes.length];

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg">
        <h1 className="mb-4 font-editorial text-4xl font-extralight tracking-tight text-foreground md:text-5xl" style={{ textWrap: "balance" }}>
          Focus Mode Active
        </h1>
        <p className="mb-16 font-editorial text-xl font-light text-muted-foreground">
          Go touch grass.
        </p>

        <blockquote className="rounded-xl border border-border bg-card p-6 text-left">
          <p className="mb-3 font-editorial text-lg font-extralight leading-relaxed text-foreground">
            &ldquo;{quote.text}&rdquo;
          </p>
          <cite className="block text-right font-mono text-xs uppercase tracking-widest text-muted-foreground not-italic">
            &mdash; {quote.author}
          </cite>
        </blockquote>
      </div>
    </div>
  );
}

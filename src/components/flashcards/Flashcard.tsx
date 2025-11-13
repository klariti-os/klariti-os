"use client";

import { useEffect, useState } from "react";

type Props = {
  front: string;
  back: string;
  onNext: () => void;
};

export default function Flashcard({ front, back, onNext }: Props) {
  const [flipped, setFlipped] = useState(false);

  function flip() {
    setFlipped(f => !f);
  }

  function next() {
    setFlipped(false);
    onNext();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight") {
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="w-full">
      <div
        className="relative mx-auto w-full max-w-xl min-h-[260px] h-[50vh] max-h-[460px] [perspective:1000px]"
      >
        <button
          onClick={flip}
          aria-label="Flip card"
          className="group relative h-full w-full rounded-2xl border border-white/20 bg-white/80 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 shadow-xl transition
          [transform-style:preserve-3d] [transform:rotateY(0deg)]
          data-[flipped=true]:[transform:rotateY(180deg)]"
          data-flipped={flipped}
        >
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-xl sm:text-2xl font-semibold [backface-visibility:hidden]">
            {front}
          </div>
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-lg sm:text-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {back}
          </div>

          <style jsx>{`
            button {
              transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            }
          `}</style>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={next}
          className="rounded-lg border border-white/20 bg-white/70 dark:bg-slate-900/70 text-sm px-3 py-2 hover:bg-white/90 dark:hover:bg-slate-900/90"
        >
          Easy
        </button>
        <button
          onClick={next}
          className="rounded-lg border border-white/20 bg-white/70 dark:bg-slate-900/70 text-sm px-3 py-2 hover:bg-white/90 dark:hover:bg-slate-900/90"
        >
          Medium
        </button>
        <button
          onClick={next}
          className="rounded-lg border border-white/20 bg-white/70 dark:bg-slate-900/70 text-sm px-3 py-2 hover:bg-white/90 dark:hover:bg-slate-900/90"
        >
          Hard
        </button>
        <button
          onClick={next}
          className="rounded-lg border border-indigo-400/40 bg-indigo-600/80 text-white text-sm px-3 py-2 hover:bg-indigo-600"
        >
          Next →
        </button>
      </div>

      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        Tips: Press <kbd>Space</kbd>/<kbd>Enter</kbd> to flip, <kbd>→</kbd> to go next.
      </p>
    </div>
  );
}

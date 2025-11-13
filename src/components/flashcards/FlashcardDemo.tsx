"use client";

import { useEffect, useMemo, useState } from "react";
import Flashcard from "./Flashcard";
import {
  fetchFlashcardDeckStub,
  FlashcardCategoryId,
  FlashcardDto,
} from "@/utils/flashcardApiStub";

type CategoryId = FlashcardCategoryId;

const categories: {
  id: CategoryId;
  label: string;
  subtitle: string;
  badge: string;
  bgClass: string;
}[] = [
  {
    id: "math",
    label: "Math",
    subtitle: "Core concepts & quick drills",
    badge: "Algebra • Arithmetic",
    bgClass: "bg-indigo-800/80",
  },
  {
    id: "biology",
    label: "Biology",
    subtitle: "Cells, systems, and life",
    badge: "Neuro • Anatomy",
    bgClass: "bg-emerald-800/80",
  },
  {
    id: "java",
    label: "Java (Basic)",
    subtitle: "Programming fundamentals",
    badge: "Loops • Classes",
    bgClass: "bg-orange-800/80",
  },
  {
    id: "history",
    label: "American History",
    subtitle: "1900–1999 highlights",
    badge: "Wars • Movements",
    bgClass: "bg-amber-800/80",
  },
  {
    id: "film",
    label: "Film Trivia",
    subtitle: "1980–2025 cinema",
    badge: "Directors • Oscars",
    bgClass: "bg-rose-800/80",
  },
];

export default function FlashcardDemo() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(
    "all"
  );
  const [index, setIndex] = useState(0);
  const [cards, setCards] = useState<FlashcardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchFlashcardDeckStub();
        if (!cancelled) {
          setCards(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load flashcards from stub.");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDeck = useMemo(() => {
    if (!cards.length) return [];
    if (selectedCategory === "all") return cards;
    return cards.filter(card => card.category === selectedCategory);
  }, [cards, selectedCategory]);

  const activeCategoryMeta =
    selectedCategory === "all"
      ? null
      : categories.find(c => c.id === selectedCategory) ?? null;

  function nextCard() {
    if (!filteredDeck.length) return;
    setIndex(i => (i + 1) % filteredDeck.length);
  }

  const current =
    filteredDeck.length > 0
      ? filteredDeck[index % filteredDeck.length]
      : null;

  return (
    <div className="mx-auto max-w-4xl p-4 mt-4 bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-xl text-neutral-100 border border-white/10">
      <h2 className="text-xl font-semibold mb-2">Flashcard Demo</h2>
      <p className="text-xs text-neutral-300 mb-4">
        Choose a deck below, then review cards with flip + difficulty options.
        This view currently uses a stubbed API response for UI testing.
      </p>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => {
            setSelectedCategory("all");
            setIndex(0);
          }}
          className={`flex flex-col justify-between rounded-xl border px-3 py-3 text-left text-xs transition
          ${
            selectedCategory === "all"
              ? "border-indigo-300 bg-slate-800/80"
              : "border-white/15 bg-slate-800/40 hover:bg-slate-800/70"
          }`}
        >
          <span className="font-semibold tracking-wide mb-1">
            All Decks
          </span>
          <span className="text-[0.7rem] text-neutral-300">
            Mix of all subjects
          </span>
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setIndex(0);
            }}
            className={`flex flex-col justify-бetween rounded-xl border px-3 py-3 text-left text-xs transition
              ${selectedCategory === cat.id
                ? `border-white/70 ${cat.bgClass}`
                : `border-white/10 ${cat.bgClass} opacity-80 hover:opacity-100`}`}
          >
            <span className="font-semibold tracking-wide mb-1">
              {cat.label}
            </span>
            <span className="text-[0.7rem] text-neutral-200">
              {cat.subtitle}
            </span>
            <span className="mt-2 inline-flex items-center rounded-full border border-white/30 bg-black/20 px-2 py-0.5 text-[0.65rem] text-neutral-100">
              {cat.badge}
            </span>
          </button>
        ))}
      </section>

      {loading && (
        <p className="mt-2 text-xs text-neutral-300">
          Loading stubbed flashcard deck…
        </p>
      )}

      {error && !loading && (
        <p className="mt-2 text-xs text-rose-300">
          {error}
        </p>
      )}

      {!loading && !error && current && (
        <>
          <Flashcard
            front={current.front}
            back={current.back}
            onNext={nextCard}
          />
          <p className="mt-4 text-xs opacity-70">
            Card {index + 1} / {filteredDeck.length}
            {selectedCategory !== "all" && activeCategoryMeta
              ? ` • Category: ${activeCategoryMeta.label}`
              : " • Category: Mixed"}
          </p>
        </>
      )}

      {!loading && !error && !current && (
        <p className="mt-4 text-xs text-neutral-300">
          No cards available for this deck yet.
        </p>
      )}
    </div>
  );
}

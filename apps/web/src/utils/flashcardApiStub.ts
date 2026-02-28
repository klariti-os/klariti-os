export type FlashcardCategoryId =
  | "math"
  | "biology"
  | "java"
  | "history"
  | "film";

export type FlashcardDto = {
  id: string;
  front: string;
  back: string;
  category: FlashcardCategoryId;
  difficulty?: "easy" | "medium" | "hard";
};

const stubDeck: FlashcardDto[] = [
  {
    id: "bio-1",
    front: "What is the powerhouse of the cell?",
    back: "The mitochondria",
    category: "biology",
    difficulty: "easy",
  },
  {
    id: "math-1",
    front: "In y = mx + b, what does m represent?",
    back: "The slope of the line.",
    category: "math",
    difficulty: "easy",
  },
  {
    id: "java-1",
    front: "Which keyword creates a new object in Java?",
    back: "`new`",
    category: "java",
    difficulty: "easy",
  },
  {
    id: "hist-1",
    front: "In which year did World War II end?",
    back: "1945",
    category: "history",
    difficulty: "medium",
  },
  {
    id: "film-1",
    front: "Who directed the film 'Inception' (2010)?",
    back: "Christopher Nolan",
    category: "film",
    difficulty: "medium",
  },
  {
    id: "math-2",
    front: "What is 2 + 2 × 3?",
    back: "8 (multiplication before addition)",
    category: "math",
    difficulty: "easy",
  },
  {
    id: "hist-2",
    front: "Which U.S. president signed the Civil Rights Act of 1964?",
    back: "Lyndon B. Johnson",
    category: "history",
    difficulty: "medium",
  },
  {
    id: "java-2",
    front: "Java: Which method is the entry point of a program?",
    back: "`public static void main(String[] args)`",
    category: "java",
    difficulty: "hard",
  },
  {
    id: "bio-2",
    front: "Which organelle contains chlorophyll?",
    back: "The chloroplast",
    category: "biology",
    difficulty: "easy",
  },
  {
    id: "film-2",
    front: "Which film won Best Picture at the 1994 Oscars?",
    back: "Schindler’s List",
    category: "film",
    difficulty: "medium",
  },
];

export async function fetchFlashcardDeckStub(): Promise<FlashcardDto[]> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return stubDeck;
}

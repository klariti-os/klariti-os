import { YoutubeTranscript } from "youtube-transcript";

const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /youtube\.com\/shorts\/([^&\n?#]+)/,
];

export function extractVideoId(url: string): string | null {
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export interface VideoMetadata {
  title: string;
  authorName: string;
  thumbnailUrl: string;
  providerName: string;
}

export async function fetchVideoMetadata(
  videoId: string
): Promise<VideoMetadata> {
  const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const response = await fetch(oEmbedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch video metadata: ${response.status}`);
  }
  const data = (await response.json()) as {
    title: string;
    author_name: string;
    thumbnail_url: string;
    provider_name: string;
  };
  return {
    title: data.title,
    authorName: data.author_name,
    thumbnailUrl: data.thumbnail_url,
    providerName: data.provider_name,
  };
}

export interface TranscriptEntry {
  text: string;
  offset: number;
  duration: number;
}

export async function fetchTranscript(
  videoId: string
): Promise<{ entries: TranscriptEntry[]; fullText: string }> {
  const raw = await YoutubeTranscript.fetchTranscript(videoId);
  const entries: TranscriptEntry[] = raw.map((item) => ({
    text: item.text,
    offset: item.offset,
    duration: item.duration,
  }));
  const fullText = entries.map((e) => e.text).join(" ");
  return { entries, fullText };
}

const CATEGORY_PATTERNS: Array<{ category: string; patterns: RegExp[] }> = (
  [
    {
      category: "Technology",
      keywords: [
        "code",
        "programming",
        "software",
        "hardware",
        "computer",
        "tech",
        "ai",
        "machine learning",
        "app",
        "development",
        "developer",
        "javascript",
        "python",
        "api",
        "cloud",
      ],
    },
    {
      category: "Education",
      keywords: [
        "learn",
        "tutorial",
        "how to",
        "guide",
        "lesson",
        "course",
        "study",
        "teach",
        "explain",
        "understanding",
        "introduction",
        "beginner",
      ],
    },
    {
      category: "Entertainment",
      keywords: [
        "funny",
        "comedy",
        "laugh",
        "joke",
        "prank",
        "fun",
        "entertain",
        "hilarious",
        "humor",
        "viral",
      ],
    },
    {
      category: "Gaming",
      keywords: [
        "game",
        "gaming",
        "play",
        "level",
        "score",
        "player",
        "fps",
        "rpg",
        "console",
        "stream",
        "minecraft",
        "roblox",
        "fortnite",
      ],
    },
    {
      category: "Music",
      keywords: [
        "song",
        "music",
        "lyrics",
        "beat",
        "melody",
        "artist",
        "band",
        "album",
        "sing",
        "concert",
        "rap",
        "pop",
      ],
    },
    {
      category: "Sports",
      keywords: [
        "sport",
        "team",
        "player",
        "score",
        "goal",
        "match",
        "tournament",
        "champion",
        "football",
        "basketball",
        "soccer",
        "athlete",
      ],
    },
    {
      category: "News & Politics",
      keywords: [
        "news",
        "politics",
        "government",
        "election",
        "president",
        "policy",
        "breaking",
        "report",
        "analysis",
      ],
    },
    {
      category: "Food & Cooking",
      keywords: [
        "recipe",
        "cook",
        "food",
        "ingredient",
        "eat",
        "meal",
        "restaurant",
        "bake",
        "chef",
        "cuisine",
      ],
    },
    {
      category: "Travel",
      keywords: [
        "travel",
        "trip",
        "country",
        "city",
        "visit",
        "destination",
        "tour",
        "vacation",
        "explore",
        "flight",
        "hotel",
      ],
    },
    {
      category: "Finance & Business",
      keywords: [
        "money",
        "invest",
        "stock",
        "business",
        "startup",
        "finance",
        "crypto",
        "economy",
        "market",
        "revenue",
        "entrepreneur",
      ],
    },
    {
      category: "Health & Fitness",
      keywords: [
        "health",
        "fitness",
        "workout",
        "exercise",
        "diet",
        "nutrition",
        "wellness",
        "gym",
        "weight",
        "yoga",
      ],
    },
  ] as Array<{ category: string; keywords: string[] }>
).map(({ category, keywords }) => ({
  category,
  patterns: keywords.map((kw) => new RegExp(kw, "gi")),
}));

export interface CategoryAnalysis {
  category: string;
  confidence: number;
  scores: Record<string, number>;
}

export function analyzeCategory(
  transcriptText: string,
  title: string
): CategoryAnalysis {
  const combined = `${title} ${transcriptText}`.toLowerCase();

  const scores: Record<string, number> = {};
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    scores[category] = patterns.reduce((acc, pattern) => {
      pattern.lastIndex = 0;
      const matches = combined.match(pattern);
      return acc + (matches ? matches.length : 0);
    }, 0);
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topCategory, topScore] = sorted[0];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    category: topScore > 0 ? topCategory : "General",
    confidence:
      totalScore > 0
        ? Math.min(Math.round((topScore / totalScore) * 100), 100)
        : 0,
    scores,
  };
}

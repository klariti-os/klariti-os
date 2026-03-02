import { google } from "googleapis";
import { config } from "dotenv";

config({ path: "../../../.env" });

const youtube = google.youtube({
  version: "v3",
  auth:
    process.env.YOUTUBE_API_KEY ??
    (() => {
      throw new Error("YOUTUBE_API_KEY is not set");
    })(),
});

class YouTubeCategoriesCache {
  private cache: Record<string, string> = {};
  private lastUpdated: Date = new Date(0);
  private cacheDuration: number = 8.64e7; // 1 day in milliseconds

  constructor() {
    this.updateCache();
  }

  /**
   * Checks if the cache is stale and updates it if necessary.
   * This method should be called before accessing the cache to ensure that the data is up to date.
   */
  private async updateCache() {
    if (Date.now() - this.lastUpdated.getTime() > this.cacheDuration) {
      this.cache = await this.fetchCategories();
      this.lastUpdated = new Date();
    }
  }

  /**
   * Fetches all categories available on YouTube for a given region code.
   *
   * @param regionCode The two-character string representing the region to fetch categories for.
   * @returns A mapping of category ID to category title.
   */
  private async fetchCategories(regionCode: string = "US") {
    const response = await youtube.videoCategories.list({
      part: ["snippet"],
      regionCode,
    });

    return (
      response.data.items?.reduce(
        (acc, category) => {
          if (category.id && category.snippet?.title) {
            acc[category.id] = category.snippet.title;
          }
          return acc;
        },
        {} as Record<string, string>,
      ) || {}
    );
  }

  /**
   * Get the title for a given category ID.
   *
   * @param categoryId The category ID.
   * @returns The title for the category.
   */
  async getCategoryTitle(categoryId: string) {
    await this.updateCache();
    return this.cache[categoryId] || "Unknown";
  }
}

const youtubeCategoriesCache = new YouTubeCategoriesCache();

/**
 * Get metadata for a YouTube video from its ID.
 * This includes the title, description, tags, and category ID.
 *
 * @param id YouTube video ID. Found after "v=" in URL.
 * @returns Object containing title, description, tags, and category ID of video.
 */
async function getVideoMetadata(id: string) {
  const response = await youtube.videos.list({
    part: ["snippet"],
    id: [id],
  });

  const video = response.data.items?.[0];
  if (!video) {
    return null;
  }

  return {
    title: video.snippet?.title || "",
    description: video.snippet?.description || "",
    tags: video.snippet?.tags || [],
    categoryId: video.snippet?.categoryId || "",
  };
}

/**
 * Classify a YouTube video based on its metadata.
 *
 * @param url YouTube video (not shorts) URL.
 * @returns Classification of the video.
 */
async function classifyYoutubeVideo(url: string) {
  const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
  if (!videoIdMatch) return null;

  const videoId = videoIdMatch[1];
  const categoryId = (await getVideoMetadata(videoId))?.categoryId;
  if (!categoryId) return null; // It might be possible not all videos have a category, so we should handle this case

  return youtubeCategoriesCache?.getCategoryTitle(categoryId);
}

/**
 * Classify a piece of content from a URL.
 * Current supported platforms: YouTube.
 *
 * @param url URL to content to classify.
 * @returns Classification of the content.
 */
async function classifyUrl(url: string) {
  const youtubeRegexp = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=/;
  if (youtubeRegexp.test(url)) {
    return await classifyYoutubeVideo(url);
  }

  // Call model here to classify the video based on the metadata

  return null;
}

(async () => {
  console.log(await classifyUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"));
})();

import { config } from "dotenv";
import { google } from "googleapis";

config({ path: "../../.env" });

export const youtubeCategories: Record<string, string> = {
  "1": "Film & Animation",
  "2": "Autos & Vehicles",
  "10": "Music",
  "15": "Pets & Animals",
  "17": "Sports",
  "18": "Short Movies",
  "19": "Travel & Events",
  "20": "Gaming",
  "21": "Videoblogging",
  "22": "People & Blogs",
  "23": "Comedy",
  "24": "Entertainment",
  "25": "News & Politics",
  "26": "Howto & Style",
  "27": "Education",
  "28": "Science & Technology",
  "29": "Nonprofits & Activism",
  "30": "Movies",
  "31": "Anime/Animation",
  "32": "Action/Adventure",
  "33": "Classics",
  "34": "Comedy",
  "35": "Documentary",
  "36": "Drama",
  "37": "Family",
  "38": "Foreign",
  "39": "Horror",
  "40": "Sci-Fi/Fantasy",
  "41": "Thriller",
  "42": "Shorts",
  "43": "Shows",
  "44": "Trailers",
};

const youtube = google.youtube({
  version: "v3",
  auth:
    process.env.YOUTUBE_API_KEY ??
    (() => {
      throw new Error("YOUTUBE_API_KEY is not set");
    })(),
});

class YouTubeCategoriesCache {
  // private lastUpdated = new Date(0);
  // private cacheDuration = 8.64e7; // 1 day in milliseconds

  /**
   * Checks if the cache is stale and updates it if necessary.
   * This method should be called before accessing the cache to ensure that the data is up to date.
   */
  private async updateCache() {
    return; // we can probably just use the hardcoded values.
    // if (Date.now() - this.lastUpdated.getTime() > this.cacheDuration) {
    //   this.cache = await this.fetchCategories();
    //   this.lastUpdated = new Date();
    // }
  }

  /**
   * Fetches all categories available on YouTube for a given region code.
   *
   * @param regionCode The two-character string representing the region to fetch categories for.
   * @returns A mapping of category ID to category title.
   */
  // private async fetchCategories(regionCode: string = "US") {
  //   const response = await youtube.videoCategories.list({
  //     part: ["snippet"],
  //     regionCode,
  //   });

  //   return (
  //     response.data.items?.reduce(
  //       (acc, category) => {
  //         if (category.id && category.snippet?.title) {
  //           acc[category.id] = category.snippet.title;
  //         }
  //         return acc;
  //       },
  //       {} as Record<string, string>,
  //     ) || {}
  //   );
  // }

  /**
   * Get the title for a given category ID.
   *
   * @param categoryId The category ID.
   * @returns The title for the category.
   */
  async getCategoryTitle(categoryId: string) {
    await this.updateCache();
    return youtubeCategories[categoryId] || "Unknown";
  }
}

// This should be stored somewhere more persistent and shared across the app.
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
    // title: video.snippet?.title || "",
    // description: video.snippet?.description || "",
    // tags: video.snippet?.tags || [],
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
  if (!categoryId) return null;

  return youtubeCategoriesCache?.getCategoryTitle(categoryId);
}

/**
 * Classify a piece of content from a URL.
 *
 * @param url YouTube URL (youtube.com/watch?v= or youtu.be/ formats).
 * @returns Classification of the content.
 */
async function classifyUrl(url: string) {
  return await classifyYoutubeVideo(url);
}

(async () => {
  let testURL = "https://youtu.be/Kourq_Lz03U?si=y9qkWUh4NimV3Qmf"
  const result = await classifyUrl(testURL);
  console.log(result);
})();

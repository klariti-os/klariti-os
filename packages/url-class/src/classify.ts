import { google } from "googleapis";
import { config } from "dotenv";

config({ path: "../../../.env" });

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY ?? (() => { throw new Error('YOUTUBE_API_KEY is not set') })(),
});

/**
 * Fetches all categories available on YouTube for a given region code.
 * Call this method once per session and cache the results to avoid hitting API rate limits.
 *
 * @param regionCode The region code (e.g., "US", "GB") to fetch categories for. Defaults to "US".
 * @returns An object with category IDs as keys and category titles as values
 */
async function getYoutubeCategories(regionCode: string = "US") {
  const response = await youtube.videoCategories.list({
    part: ["snippet"],
    regionCode,
  });

  // Map category IDs to their titles
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
 * Get metadata for a YouTube video from its ID. This includes the title, description, tags, and category ID.
 *
 * @param id YouTube video ID. Found after "v=" in URL.
 * @returns Object containing title, description, tags, and category ID of video.
 */
async function getVideoMetadata(id: string) {
  const response = await youtube.videos.list({
    part: ["snippet"],
    id: [videoId],
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

async function classifyUrl(url: string) {
  const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
  if (!videoIdMatch) return null;

  const videoId = videoIdMatch[1];
  const metadata = await getVideoMetadata(videoId);
  if (!metadata) return null;

  // Call model here to classify the video based on the metadata

  return metadata;
}

(async () => {
  const result = await classifyUrl("https://youtu.be/99VNCxlbW1c?si=7KaoMCcs5awP3Z_D");
  console.log(result);
})();

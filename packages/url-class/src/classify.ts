import { google } from "googleapis";
import { config } from "dotenv";

config({ path: "../../../.env" });

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY ?? (() => { throw new Error('YOUTUBE_API_KEY is not set') })(),
});

async function getVideoMetadata(videoId: string) {
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
  const result = await classifyUrl("https://youtu.be/EZQ_cME6yrU");
  console.log(result?.categoryId);
})();

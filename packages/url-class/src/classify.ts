import "dotenv/config";
import { google } from "googleapis";

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
    // Should probably throw an error here
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
  // Regex to extract video ID from YouTube URL (v=<11 characters> followed by more parameters or end of string)
  const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
  if (!videoIdMatch) {
    return null;
  }

  // videoIdMatch[1] is the captured video ID
  const videoId = videoIdMatch[1];
  const metadata = await getVideoMetadata(videoId);
  if (!metadata) {
    return null;
  }

  // Call model here to classify the video based on the metadata
  console.log(classifyUrl("youtube.com"))
}

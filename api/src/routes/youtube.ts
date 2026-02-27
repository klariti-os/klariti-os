import { FastifyInstance } from "fastify";
import {
  extractVideoId,
  fetchVideoMetadata,
  fetchTranscript,
  analyzeCategory,
} from "../services/youtubeService";

export default async function youtubeRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: { url: string };
  }>("/analyze", {
    schema: {
      body: {
        type: "object",
        required: ["url"],
        properties: {
          url: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      const { url } = request.body;

      const videoId = extractVideoId(url);
      if (!videoId) {
        return reply.code(400).send({ error: "Invalid YouTube URL" });
      }

      const [metadataResult, transcriptResult] = await Promise.allSettled([
        fetchVideoMetadata(videoId),
        fetchTranscript(videoId),
      ]);

      const metadata =
        metadataResult.status === "fulfilled" ? metadataResult.value : null;
      const transcriptData =
        transcriptResult.status === "fulfilled" ? transcriptResult.value : null;

      if (!metadata && !transcriptData) {
        const metaError =
          metadataResult.status === "rejected"
            ? (metadataResult.reason as Error).message
            : undefined;
        const transcriptError =
          transcriptResult.status === "rejected"
            ? (transcriptResult.reason as Error).message
            : undefined;
        fastify.log.error({ metaError, transcriptError }, "YouTube fetch failed");
        return reply.code(502).send({
          error: "Failed to retrieve video data from YouTube",
          details: { metadata: metaError, transcript: transcriptError },
        });
      }

      const title = metadata?.title ?? "";
      const transcriptText = transcriptData?.fullText ?? "";

      const analysis = analyzeCategory(transcriptText, title);

      return reply.send({
        videoId,
        url,
        metadata,
        transcript: transcriptData,
        analysis,
      });
    },
  });
}

import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { config } from "../config.js";

const allowedOrigins = new Set(config.corsOrigins);

export default fp(
  async function corsPlugin(fastify: FastifyInstance) {
    await fastify.register(cors, {
      origin: (origin, cb) => {
        // allow requests with no origin (curl, server-to-server)
        // allow chrome-extension:// origins (browser extension)
        if (!origin || allowedOrigins.has(origin) || origin.startsWith("chrome-extension://")) {
          cb(null, true);
        } else {
          cb(new Error(`Origin ${origin} not allowed`), false);
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    });
  },
  { name: "cors" }
);

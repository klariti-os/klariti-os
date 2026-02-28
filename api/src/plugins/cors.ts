import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

export default fp(
  async function corsPlugin(fastify: FastifyInstance) {
    await fastify.register(cors, {
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    });
  },
  { name: "cors" }
);

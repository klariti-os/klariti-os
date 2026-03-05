import { FastifyInstance } from "fastify";
import { resolveStatus, resolveMessage } from "../utils/errors";

type SignUpBody = { name: string; email: string; password: string };
type SignInBody = { email: string; password: string };

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: SignUpBody }>("/api/sign-up", {
    schema: {
      tags: ["Auth"],
      body: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string", nullable: true },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                emailVerified: { type: "boolean" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
        400: {
          type: "object",
          properties: { error: { type: "string" } },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = await fastify.auth.api.signUpEmail({
          body: request.body,
        });
        return reply.send({
          token: data.token ?? null,
          user: data.user,
        });
      } catch (err: any) {
        return reply
          .status(resolveStatus(err, 400))
          .send({ error: resolveMessage(err, "Sign-up failed") });
      }
    },
  });

  fastify.post<{ Body: SignInBody }>("/api/sign-in", {
    schema: {
      tags: ["Auth"],
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                emailVerified: { type: "boolean" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
        401: {
          type: "object",
          properties: { error: { type: "string" } },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = await fastify.auth.api.signInEmail({
          body: request.body,
        });
        return reply.send({
          token: data.token,
          user: data.user,
        });
      } catch (err: any) {
        return reply
          .status(resolveStatus(err, 401))
          .send({ error: resolveMessage(err, "Invalid email or password") });
      }
    },
  });
}

import { FastifyInstance } from "fastify";
import { auth } from "@klariti/auth/server";

type SignUpBody = { name: string; email: string; password: string };
type SignInBody = { email: string; password: string };

const STATUS_MAP: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

function resolveStatus(err: any, fallback = 400): number {
  const s = err?.status ?? err?.statusCode;
  if (typeof s === "number") return s;
  if (typeof s === "string") return STATUS_MAP[s] ?? fallback;
  return fallback;
}

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
        const data = await auth.api.signUpEmail({
          body: request.body,
        });
        return reply.send({
          token: data.token ?? null,
          user: data.user,
        });
      } catch (err: any) {
        return reply.status(resolveStatus(err, 400)).send({
          error: err?.body?.message ?? err?.message ?? "Sign-up failed",
        });
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
        const data = await auth.api.signInEmail({
          body: request.body,
        });
        return reply.send({
          token: data.token,
          user: data.user,
        });
      } catch (err: any) {
        return reply.status(resolveStatus(err, 401)).send({
          error: err?.body?.message ?? err?.message ?? "Invalid email or password",
        });
      }
    },
  });
}

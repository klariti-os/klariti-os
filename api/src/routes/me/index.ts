import { FastifyInstance } from "fastify";
import { auth } from "@klariti/auth/server";
import {
  userObject,
  errorObject,
  updateProfileBody,
  changeEmailBody,
  changePasswordBody,
} from "./schema";

/** Map better-auth string status codes to numeric HTTP codes */
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

function resolveMessage(err: any, fallback: string): string {
  return err?.body?.message ?? err?.message ?? fallback;
}

export default async function meRoutes(fastify: FastifyInstance) {
  // ── GET / ─ current user profile ──────────────────────────────────────────
  fastify.get("/", {
    schema: {
      tags: ["Me"],
      security: [{ bearerAuth: [] }],
      response: { 200: userObject, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      return reply.send(request.session!.user);
    },
  });

  // ── PATCH / ─ update name / image ─────────────────────────────────────────
  fastify.patch<{
    Body: { name?: string; image?: string | null };
  }>("/", {
    schema: {
      tags: ["Me"],
      security: [{ bearerAuth: [] }],
      body: updateProfileBody,
      response: { 200: userObject, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value !== undefined) {
          headers.set(key, Array.isArray(value) ? value.join(", ") : value);
        }
      }

      try {
        await auth.api.updateUser({
          headers,
          body: request.body,
        });
        const session = await auth.api.getSession({ headers });
        return reply.send(session!.user);
      } catch (err: any) {
        return reply
          .status(resolveStatus(err, 400))
          .send({ error: resolveMessage(err, "Update failed") });
      }
    },
  });

  // ── POST /change-email ────────────────────────────────────────────────────
  fastify.post<{
    Body: { newEmail: string };
  }>("/change-email", {
    schema: {
      tags: ["Me"],
      security: [{ bearerAuth: [] }],
      body: changeEmailBody,
      response: {
        200: {
          type: "object",
          properties: { status: { type: "boolean" } },
        },
        401: errorObject,
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value !== undefined) {
          headers.set(key, Array.isArray(value) ? value.join(", ") : value);
        }
      }

      try {
        const result = await auth.api.changeEmail({
          headers,
          body: request.body,
        });
        return reply.send(result);
      } catch (err: any) {
        return reply
          .status(resolveStatus(err, 400))
          .send({ error: resolveMessage(err, "Change email failed") });
      }
    },
  });

  // ── POST /change-password ─────────────────────────────────────────────────
  fastify.post<{
    Body: { currentPassword: string; newPassword: string };
  }>("/change-password", {
    schema: {
      tags: ["Me"],
      security: [{ bearerAuth: [] }],
      body: changePasswordBody,
      response: {
        200: {
          type: "object",
          properties: { status: { type: "boolean" } },
        },
        401: errorObject,
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value !== undefined) {
          headers.set(key, Array.isArray(value) ? value.join(", ") : value);
        }
      }

      try {
        const result = await auth.api.changePassword({
          headers,
          body: request.body,
        });
        return reply.send(result);
      } catch (err: any) {
        return reply
          .status(resolveStatus(err, 400))
          .send({ error: resolveMessage(err, "Change password failed") });
      }
    },
  });
}

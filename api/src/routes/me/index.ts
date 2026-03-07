import { FastifyInstance } from "fastify";
import { toWebHeaders } from "../../utils/headers";
import { resolveStatus, resolveMessage } from "../../utils/errors";
import {
  userObject,
  errorObject,
  updateProfileBody,
  changeEmailBody,
  changePasswordBody,
} from "./schema";

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
      const headers = toWebHeaders(request.headers);

      try {
        await fastify.auth.api.updateUser({
          headers,
          body: request.body,
        });
        const session = await fastify.auth.api.getSession({ headers });
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
      const headers = toWebHeaders(request.headers);

      try {
        const result = await fastify.auth.api.changeEmail({
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
      const headers = toWebHeaders(request.headers);

      try {
        const result = await fastify.auth.api.changePassword({
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

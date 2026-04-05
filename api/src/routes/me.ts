import { FastifyInstance } from "fastify";
import type { UpdateProfileBody, ChangeEmailBody, ChangePasswordBody } from "@klariti/contracts";
import { resolveStatus, resolveMessage } from "../utils/errors.js";
import { toWebHeaders } from "../utils/headers.js";

export default async function meRoutes(fastify: FastifyInstance) {
  fastify.get("/api/me", {
    schema: { tags: ["Me"], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => reply.send(request.session!.user),
  });

  fastify.patch<{ Body: UpdateProfileBody }>("/api/me", {
    schema: { tags: ["Me"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const headers = toWebHeaders(request.headers);
      try {
        await fastify.auth.api.updateUser({ headers, body: request.body });
        const session = await fastify.auth.api.getSession({ headers });
        return reply.send(session!.user);
      } catch (err: any) {
        return reply.status(resolveStatus(err, 400)).send({ error: resolveMessage(err, "Update failed") });
      }
    },
  });

  fastify.post<{ Body: ChangeEmailBody }>("/api/me/change-email", {
    schema: { tags: ["Me"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const headers = toWebHeaders(request.headers);
      try {
        const result = await fastify.auth.api.changeEmail({ headers, body: request.body });
        return reply.send(result);
      } catch (err: any) {
        return reply.status(resolveStatus(err, 400)).send({ error: resolveMessage(err, "Change email failed") });
      }
    },
  });

  fastify.post<{ Body: ChangePasswordBody }>("/api/me/change-password", {
    schema: { tags: ["Me"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const headers = toWebHeaders(request.headers);
      try {
        const result = await fastify.auth.api.changePassword({ headers, body: request.body });
        return reply.send(result);
      } catch (err: any) {
        return reply.status(resolveStatus(err, 400)).send({ error: resolveMessage(err, "Change password failed") });
      }
    },
  });
}

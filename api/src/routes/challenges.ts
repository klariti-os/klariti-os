import { FastifyInstance } from "fastify";
import { CreateChallengeBodySchema, type CreateChallengeBody, type UpdateChallengeBody } from "@klariti/contracts";
import { challengesService } from "../services/challenges.service.js";

export default async function challengesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.verifySession);

  fastify.get("/api/me/challenges", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const rows = await challengesService.listForUser(request.session!.user.id);
      return reply.send(rows);
    },
  });

  fastify.post<{ Body: CreateChallengeBody }>("/api/me/challenges", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    handler: async (request, reply) => {
      const parsed = CreateChallengeBodySchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid body" });
      const challenge = await challengesService.create(request.session!.user.id, parsed.data);
      return reply.send(challenge);
    },
  });

  fastify.get<{ Params: { id: string } }>("/api/me/challenges/requests/received", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const reqs = await challengesService.listReceivedRequests(request.session!.user.id);
      return reply.send(reqs);
    },
  });

  fastify.get("/api/me/challenges/requests/sent", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const reqs = await challengesService.listSentRequests(request.session!.user.id);
      return reply.send(reqs);
    },
  });

  fastify.delete<{ Params: { requestId: string } }>("/api/me/challenges/requests/:requestId", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const result = await challengesService.withdrawRequest(request.params.requestId, request.session!.user.id);
      if ("error" in result) return reply.status(403).send({ error: result.error });
      return reply.send(result.data);
    },
  });

  fastify.patch<{ Params: { requestId: string }; Body: { action: "accept" | "decline" | "ignore" } }>("/api/me/challenges/requests/:requestId", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    handler: async (request, reply) => {
      const result = await challengesService.respondToRequest(request.params.requestId, request.session!.user.id, request.body.action);
      if ("error" in result) return reply.status(403).send({ error: result.error });
      return reply.send(result.data);
    },
  });

  fastify.get<{ Params: { id: string } }>("/api/me/challenges/:id", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const result = await challengesService.getForParticipant(request.params.id, request.session!.user.id);
      if (!result) return reply.status(403).send({ error: "Not a participant" });
      return reply.send(result.challenge);
    },
  });

  fastify.put<{ Params: { id: string }; Body: UpdateChallengeBody }>("/api/me/challenges/:id", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    handler: async (request, reply) => {
      const challenge = await challengesService.getAsCreator(request.params.id, request.session!.user.id);
      if (!challenge) return reply.status(403).send({ error: "Not found or not creator" });
      const updated = await challengesService.update(request.params.id, request.body);
      return reply.send(updated);
    },
  });

  fastify.delete<{ Params: { id: string } }>("/api/me/challenges/:id", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const challenge = await challengesService.getAsCreator(request.params.id, request.session!.user.id);
      if (!challenge) return reply.status(403).send({ error: "Not found or not creator" });
      await challengesService.delete(request.params.id);
      return reply.send({ success: true });
    },
  });

  fastify.delete<{ Params: { id: string } }>("/api/me/challenges/:id/leave", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const result = await challengesService.getForParticipant(request.params.id, request.session!.user.id);
      if (!result) return reply.status(403).send({ error: "Not a participant" });
      if (result.challenge.creator_id === request.session!.user.id) {
        return reply.status(403).send({ error: "Creator cannot leave their own challenge" });
      }
      await challengesService.leave(request.params.id, request.session!.user.id);
      return reply.send({ success: true });
    },
  });

  fastify.post<{ Params: { id: string }; Body: { user_id: string } }>("/api/me/challenges/:id/invite", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    handler: async (request, reply) => {
      const challenge = await challengesService.getAsCreator(request.params.id, request.session!.user.id);
      if (!challenge) return reply.status(403).send({ error: "Not found or not creator" });
      const result = await challengesService.invite(request.params.id, request.session!.user.id, request.body.user_id);
      if ("error" in result) return reply.status(result.status!).send({ error: result.error });
      return reply.send(result.data);
    },
  });

  fastify.patch<{ Params: { id: string }; Body: { status: "active" | "paused" } }>("/api/me/challenges/:id/status", {
    schema: { tags: ["Challenges"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    handler: async (request, reply) => {
      const result = await challengesService.getForParticipant(request.params.id, request.session!.user.id);
      if (!result) return reply.status(403).send({ error: "Not a participant" });
      const [updated] = await challengesService.updateParticipantStatus(request.params.id, request.session!.user.id, request.body.status);
      return reply.send(updated);
    },
  });
}

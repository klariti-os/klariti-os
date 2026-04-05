import { FastifyInstance } from "fastify";
import type { SendFriendRequestBody } from "@klariti/contracts";
import { friendsService } from "../services/friends.service.js";

export default async function friendsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.verifySession);

  fastify.get("/api/me/friends", {
    schema: { tags: ["Friends"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const friends = await friendsService.listFriends(request.session!.user.id);
      return reply.send(friends);
    },
  });

  fastify.get("/api/me/friends/requests/sent", {
    schema: { tags: ["Friends"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const reqs = await friendsService.listSentRequests(request.session!.user.id);
      return reply.send(reqs);
    },
  });

  fastify.get("/api/me/friends/requests/received", {
    schema: { tags: ["Friends"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const reqs = await friendsService.listReceivedRequests(request.session!.user.id);
      return reply.send(reqs);
    },
  });

  fastify.post<{ Body: SendFriendRequestBody }>("/api/me/friends/requests", {
    schema: { tags: ["Friends"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    handler: async (request, reply) => {
      const result = await friendsService.sendRequest(request.session!.user.id, request.body.addressee_id);
      if ("error" in result) return reply.status(400).send({ error: result.error });
      return reply.send(result.data);
    },
  });

  fastify.patch<{ Params: { requestId: string }; Body: { action: "accept" | "decline" } }>("/api/me/friends/requests/:requestId", {
    schema: { tags: ["Friends"], security: [{ bearerAuth: [] }], body: { type: "object" } },
    handler: async (request, reply) => {
      const result = await friendsService.respondToRequest(request.params.requestId, request.session!.user.id, request.body.action);
      if ("error" in result) return reply.status(403).send({ error: result.error });
      return reply.send(result.data);
    },
  });

  fastify.delete<{ Params: { requestId: string } }>("/api/me/friends/requests/:requestId", {
    schema: { tags: ["Friends"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const result = await friendsService.withdrawRequest(request.params.requestId, request.session!.user.id);
      if ("error" in result) return reply.status(403).send({ error: result.error });
      return reply.send(result.data);
    },
  });

  fastify.delete<{ Params: { friendshipId: string } }>("/api/me/friends/:friendshipId", {
    schema: { tags: ["Friends"], security: [{ bearerAuth: [] }] },
    handler: async (request, reply) => {
      const result = await friendsService.removeFriend(request.params.friendshipId, request.session!.user.id);
      if ("error" in result) return reply.status(403).send({ error: result.error });
      return reply.send(result.data);
    },
  });
}

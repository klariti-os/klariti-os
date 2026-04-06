import { initServer } from "@ts-rest/fastify";

const s = initServer();
import { requireSession } from "../common/guards.js";
import { friendsService } from "./service.js";
import { serializeFriendRequest } from "./serializers.js";
import { friendsContract } from "./contract.js";

const sessionRoute = { hooks: { preHandler: requireSession } };

export const friendsRouter = s.router(friendsContract, {
  list: {
    ...sessionRoute,
    handler: async ({ request }) => ({
      status: 200,
      body: await friendsService.listFriends(request.session!.user.id),
    }),
  },

  listSentRequests: {
    ...sessionRoute,
    handler: async ({ request }) => ({
      status: 200,
      body: await friendsService.listSentRequests(request.session!.user.id),
    }),
  },

  listReceivedRequests: {
    ...sessionRoute,
    handler: async ({ request }) => ({
      status: 200,
      body: await friendsService.listReceivedRequests(request.session!.user.id),
    }),
  },

  sendRequest: {
    ...sessionRoute,
    handler: async ({ body, request }) => {
      const result = await friendsService.sendRequest(
        request.session!.user.id,
        body.addressee_id,
      );

      if ("error" in result) {
        return { status: 400, body: { error: result.error } };
      }

      return {
        status: 200,
        body: serializeFriendRequest(result.data),
      };
    },
  },

  respondToRequest: {
    ...sessionRoute,
    handler: async ({ params, body, request }) => {
      const result = await friendsService.respondToRequest(
        params.requestId,
        request.session!.user.id,
        body.action,
      );

      if ("error" in result) {
        return { status: 403, body: { error: result.error } };
      }

      return {
        status: 200,
        body: serializeFriendRequest(result.data),
      };
    },
  },

  withdrawRequest: {
    ...sessionRoute,
    handler: async ({ params, request }) => {
      const result = await friendsService.withdrawRequest(
        params.requestId,
        request.session!.user.id,
      );

      if ("error" in result) {
        return { status: 403, body: { error: result.error } };
      }

      return {
        status: 200,
        body: serializeFriendRequest(result.data),
      };
    },
  },

  remove: {
    ...sessionRoute,
    handler: async ({ params, request }) => {
      const result = await friendsService.removeFriend(
        params.friendshipId,
        request.session!.user.id,
      );

      if ("error" in result) {
        return { status: 403, body: { error: result.error } };
      }

      return {
        status: 200,
        body: result.data,
      };
    },
  },
});

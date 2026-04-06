import { initServer } from "@ts-rest/fastify";

const s = initServer();
import { requireSession } from "../common/guards.js";
import { challengesService } from "./service.js";
import { challengesContract } from "./contract.js";
import {
  serializeChallenge,
  serializeChallengeRequest,
  serializeChallengeWithStatus,
  serializeParticipant,
} from "./serializers.js";

const sessionRoute = { hooks: { preHandler: requireSession } };

export const challengesRouter = s.router(challengesContract, {
  list: {
    ...sessionRoute,
    handler: async ({ request }) => {
      const rows = await challengesService.listForUser(request.session!.user.id);

      return {
        status: 200,
        body: rows.map(serializeChallengeWithStatus),
      };
    },
  },

  create: {
    ...sessionRoute,
    handler: async ({ body, request }) => {
      const challenge = await challengesService.create(request.session!.user.id, body);

      return {
        status: 200,
        body: serializeChallenge(challenge),
      };
    },
  },

  getById: {
    ...sessionRoute,
    handler: async ({ params, request }) => {
      const result = await challengesService.getForParticipant(params.id, request.session!.user.id);

      if (!result) {
        return { status: 403, body: { error: "Not a participant" } };
      }

      return {
        status: 200,
        body: serializeChallenge(result.challenge),
      };
    },
  },

  update: {
    ...sessionRoute,
    handler: async ({ params, body, request }) => {
      const challenge = await challengesService.getAsCreator(params.id, request.session!.user.id);

      if (!challenge) {
        return { status: 403, body: { error: "Not found or not creator" } };
      }

      const updated = await challengesService.update(params.id, body);

      return {
        status: 200,
        body: serializeChallenge(updated),
      };
    },
  },

  delete: {
    ...sessionRoute,
    handler: async ({ params, request }) => {
      const challenge = await challengesService.getAsCreator(params.id, request.session!.user.id);

      if (!challenge) {
        return { status: 403, body: { error: "Not found or not creator" } };
      }

      await challengesService.delete(params.id);

      return {
        status: 200,
        body: { success: true },
      };
    },
  },

  leave: {
    ...sessionRoute,
    handler: async ({ params, request }) => {
      const result = await challengesService.getForParticipant(params.id, request.session!.user.id);

      if (!result) {
        return { status: 403, body: { error: "Not a participant" } };
      }

      if (result.challenge.creator_id === request.session!.user.id) {
        return {
          status: 403,
          body: { error: "Creator cannot leave their own challenge" },
        };
      }

      await challengesService.leave(params.id, request.session!.user.id);

      return {
        status: 200,
        body: { success: true },
      };
    },
  },

  invite: {
    ...sessionRoute,
    handler: async ({ params, body, request }) => {
      const challenge = await challengesService.getAsCreator(params.id, request.session!.user.id);

      if (!challenge) {
        return { status: 403, body: { error: "Not found or not creator" } };
      }

      const result = await challengesService.invite(
        params.id,
        request.session!.user.id,
        body.user_id,
      );

      if ("error" in result) {
        const status = result.status === 400 ? 400 : 403;

        return {
          status,
          body: { error: result.error },
        };
      }

      return {
        status: 200,
        body: serializeChallengeRequest(result.data),
      };
    },
  },

  updateStatus: {
    ...sessionRoute,
    handler: async ({ params, body, request }) => {
      const result = await challengesService.getForParticipant(params.id, request.session!.user.id);

      if (!result) {
        return { status: 403, body: { error: "Not a participant" } };
      }

      const [updated] = await challengesService.updateParticipantStatus(
        params.id,
        request.session!.user.id,
        body.status,
      );

      return {
        status: 200,
        body: serializeParticipant(updated),
      };
    },
  },

  listReceivedRequests: {
    ...sessionRoute,
    handler: async ({ request }) => {
      const requests = await challengesService.listReceivedRequests(request.session!.user.id);

      return {
        status: 200,
        body: requests.map(serializeChallengeRequest),
      };
    },
  },

  listSentRequests: {
    ...sessionRoute,
    handler: async ({ request }) => {
      const requests = await challengesService.listSentRequests(request.session!.user.id);

      return {
        status: 200,
        body: requests.map(serializeChallengeRequest),
      };
    },
  },

  withdrawRequest: {
    ...sessionRoute,
    handler: async ({ params, request }) => {
      const result = await challengesService.withdrawRequest(
        params.requestId,
        request.session!.user.id,
      );

      if ("error" in result) {
        return { status: 403, body: { error: result.error } };
      }

      return {
        status: 200,
        body: serializeChallengeRequest(result.data),
      };
    },
  },

  respondToRequest: {
    ...sessionRoute,
    handler: async ({ params, body, request }) => {
      const result = await challengesService.respondToRequest(
        params.requestId,
        request.session!.user.id,
        body.action,
      );

      if ("error" in result) {
        return { status: 403, body: { error: result.error } };
      }

      return {
        status: 200,
        body: serializeChallengeRequest(result.data),
      };
    },
  },
});

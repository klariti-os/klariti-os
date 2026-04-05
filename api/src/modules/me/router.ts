import { meContract } from "./contract.js";
import { initServer } from "@ts-rest/fastify";

const s = initServer();
import { requireSession } from "../common/guards.js";
import { resolveStatus, resolveMessage } from "../auth/errors.js";
import {
  serializeChangeEmailResponse,
  serializeChangePasswordResponse,
  serializeUser,
} from "../auth/serializers.js";

const sessionRoute = { hooks: { preHandler: requireSession } };

export const meRouter = s.router(meContract, {
  getProfile: {
    ...sessionRoute,
    handler: async ({ request }) => ({
      status: 200,
      body: serializeUser(request.session!.user),
    }),
  },

  updateProfile: {
    ...sessionRoute,
    handler: async ({ body, request }) => {
      try {
        await request.server.auth.api.updateUser({ headers: request.webHeaders(), body });
        const session = await request.server.auth.api.getSession({ headers: request.webHeaders() });

        return {
          status: 200,
          body: serializeUser(session!.user),
        };
      } catch (err: any) {
        const status = resolveStatus(err, 400);

        return {
          status: status === 401 ? 401 : 400,
          body: { error: resolveMessage(err, "Update failed") },
        };
      }
    },
  },

  changeEmail: {
    ...sessionRoute,
    handler: async ({ body, request }) => {
      try {
        const result = await request.server.auth.api.changeEmail({ headers: request.webHeaders(), body });

        return {
          status: 200,
          body: serializeChangeEmailResponse(result),
        };
      } catch (err: any) {
        const status = resolveStatus(err, 400);

        return {
          status: status === 401 ? 401 : 400,
          body: { error: resolveMessage(err, "Change email failed") },
        };
      }
    },
  },

  changePassword: {
    ...sessionRoute,
    handler: async ({ body, request }) => {
      try {
        const result = await request.server.auth.api.changePassword({ headers: request.webHeaders(), body });

        return {
          status: 200,
          body: serializeChangePasswordResponse({
            token: result.token ?? null,
            user: result.user,
          }),
        };
      } catch (err: any) {
        const status = resolveStatus(err, 400);

        return {
          status: status === 401 ? 401 : 400,
          body: { error: resolveMessage(err, "Change password failed") },
        };
      }
    },
  },
});

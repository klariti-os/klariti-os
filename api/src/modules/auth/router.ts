import type { FastifyInstance } from "fastify";
import { initServer } from "@ts-rest/fastify";

const s = initServer();
import { resolveStatus, resolveMessage } from "./errors.js";
import { serializeAuthResponse, serializeUser } from "./serializers.js";
import { authContract } from "./contract.js";
import type { User } from "./schemas.js";

async function resolveSessionUser(
  fastify: FastifyInstance,
  token: string | null | undefined,
  fallbackUser: User,
) {
  if (!token) return fallbackUser;

  const session = await fastify.auth.api.getSession({
    headers: new Headers({ authorization: `Bearer ${token}` }),
  });

  return session?.user ? serializeUser(session.user) : fallbackUser;
}

export const authRouter = s.router(authContract, {
  signUp: async ({ body, request }) => {
    try {
      const data = await request.server.auth.api.signUpEmail({ body });
      const serializedUser = serializeUser(data.user);
      const user = await resolveSessionUser(request.server, data.token, serializedUser);

      return {
        status: 200,
        body: serializeAuthResponse({ token: data.token ?? null, user }),
      };
    } catch (err: any) {
      const status = resolveStatus(err, 400);

      return {
        status: status === 422 ? 422 : 400,
        body: { error: resolveMessage(err, "Sign-up failed") },
      };
    }
  },

  signIn: async ({ body, request }) => {
    try {
      const data = await request.server.auth.api.signInEmail({ body });
      const serializedUser = serializeUser(data.user);
      const user = await resolveSessionUser(request.server, data.token, serializedUser);

      return {
        status: 200,
        body: serializeAuthResponse({ token: data.token ?? null, user }),
      };
    } catch (err: any) {
      const status = resolveStatus(err, 401);

      return {
        status: status === 400 ? 400 : status === 403 ? 403 : 401,
        body: { error: resolveMessage(err, "Invalid email or password") },
      };
    }
  },
});

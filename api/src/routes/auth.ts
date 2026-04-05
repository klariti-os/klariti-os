import { FastifyInstance } from "fastify";
import type { SignUpBody, SignInBody } from "@klariti/contracts";
import { resolveStatus, resolveMessage } from "../utils/errors.js";
import { toWebHeaders } from "../utils/headers.js";

async function resolveSessionUser(
  fastify: FastifyInstance,
  token: string | null | undefined,
  fallbackUser: unknown,
) {
  if (!token) return fallbackUser;
  const session = await fastify.auth.api.getSession({
    headers: new Headers({ authorization: `Bearer ${token}` }),
  });
  return session?.user ?? fallbackUser;
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: SignUpBody }>("/api/sign-up", {
    schema: { tags: ["Auth"], body: { type: "object" } },
    handler: async (request, reply) => {
      try {
        const data = await fastify.auth.api.signUpEmail({ body: request.body });
        const user = await resolveSessionUser(fastify, data.token, data.user);
        return reply.send({ token: data.token ?? null, user });
      } catch (err: any) {
        return reply.status(resolveStatus(err, 400)).send({ error: resolveMessage(err, "Sign-up failed") });
      }
    },
  });

  fastify.post<{ Body: SignInBody }>("/api/sign-in", {
    schema: { tags: ["Auth"], body: { type: "object" } },
    handler: async (request, reply) => {
      try {
        const data = await fastify.auth.api.signInEmail({ body: request.body });
        const user = await resolveSessionUser(fastify, data.token, data.user);
        return reply.send({ token: data.token ?? null, user });
      } catch (err: any) {
        return reply.status(resolveStatus(err, 401)).send({ error: resolveMessage(err, "Invalid email or password") });
      }
    },
  });
}

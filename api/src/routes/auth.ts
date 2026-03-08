import { FastifyInstance } from "fastify";
import { resolveStatus, resolveMessage } from "../utils/errors";
import { errorObject, userObject } from "../schemas/shared.schema";
import { signUpBody, signInBody } from "../schemas/auth.schema";

type SignUpBody = { name: string; email: string; password: string };
type SignInBody = { email: string; password: string };

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: SignUpBody }>("/api/sign-up", {
    schema: {
      tags: ["Auth"],
      body: signUpBody,
      response: {
        200: {
          type: "object",
          properties: { token: { type: "string", nullable: true }, user: userObject },
        },
        400: errorObject,
      },
    },
    handler: async (request, reply) => {
      try {
        const data = await fastify.auth.api.signUpEmail({ body: request.body });
        return reply.send({ token: data.token ?? null, user: data.user });
      } catch (err: any) {
        return reply.status(resolveStatus(err, 400)).send({ error: resolveMessage(err, "Sign-up failed") });
      }
    },
  });

  fastify.post<{ Body: SignInBody }>("/api/sign-in", {
    schema: {
      tags: ["Auth"],
      body: signInBody,
      response: {
        200: {
          type: "object",
          properties: { token: { type: "string" }, user: userObject },
        },
        401: errorObject,
      },
    },
    handler: async (request, reply) => {
      try {
        const data = await fastify.auth.api.signInEmail({ body: request.body });
        return reply.send({ token: data.token, user: data.user });
      } catch (err: any) {
        return reply.status(resolveStatus(err, 401)).send({ error: resolveMessage(err, "Invalid email or password") });
      }
    },
  });
}

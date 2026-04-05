import type { FastifyReply, FastifyRequest } from "fastify";

export async function requireSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return request.server.verifySession(request, reply);
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return request.server.verifyAdmin(request, reply);
}

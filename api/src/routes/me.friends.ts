import { FastifyInstance } from "fastify";
import { db, friendshipsTable, eq, and, or, ne } from "@klariti/database";
import { errorObject } from "../schemas/shared.schema";
import { friendshipObject } from "../schemas/friends.schema";

export default async function friendsRoutes(fastify: FastifyInstance) {
  // List accepted friends
  fastify.get("/", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      response: { 200: { type: "array", items: friendshipObject }, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const friends = await db
        .select()
        .from(friendshipsTable)
        .where(
          and(
            or(eq(friendshipsTable.user_a_id, userId), eq(friendshipsTable.user_b_id, userId)),
            eq(friendshipsTable.status, "accepted"),
          )
        );
      return reply.send(friends);
    },
  });

  // Pending incoming requests (where I'm the addressee)
  fastify.get("/requests", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      response: { 200: { type: "array", items: friendshipObject }, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const requests = await db
        .select()
        .from(friendshipsTable)
        .where(
          and(
            or(eq(friendshipsTable.user_a_id, userId), eq(friendshipsTable.user_b_id, userId)),
            eq(friendshipsTable.status, "pending"),
            ne(friendshipsTable.requester_id, userId),
          )
        );
      return reply.send(requests);
    },
  });

  // Send a friend request
  fastify.post<{ Body: { addressee_id: string } }>("/", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["addressee_id"],
        properties: { addressee_id: { type: "string" } },
      },
      response: { 200: friendshipObject, 400: errorObject, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { addressee_id } = request.body;
      if (userId === addressee_id) return reply.status(400).send({ error: "Cannot friend yourself" });

      // Canonical ordering: user_a_id is always the lexicographically smaller id
      const [userA, userB] = userId < addressee_id ? [userId, addressee_id] : [addressee_id, userId];

      const [existing] = await db
        .select()
        .from(friendshipsTable)
        .where(and(eq(friendshipsTable.user_a_id, userA), eq(friendshipsTable.user_b_id, userB)));
      if (existing) return reply.status(400).send({ error: "Friend request already exists" });

      const [friendship] = await db
        .insert(friendshipsTable)
        .values({ user_a_id: userA, user_b_id: userB, requester_id: userId, status: "pending" })
        .returning();
      return reply.send(friendship);
    },
  });

  // Accept or block a pending request (addressee only)
  fastify.patch<{ Body: { status: "accepted" | "blocked" } }>("/:id", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: ["accepted", "blocked"] } },
      },
      response: { 200: friendshipObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { id } = request.params as { id: string };
      const { status } = request.body;
      const [updated] = await db
        .update(friendshipsTable)
        .set({ status, updated_at: new Date() })
        .where(
          and(
            eq(friendshipsTable.id, id),
            or(eq(friendshipsTable.user_a_id, userId), eq(friendshipsTable.user_b_id, userId)),
            ne(friendshipsTable.requester_id, userId),
            eq(friendshipsTable.status, "pending"),
          )
        )
        .returning();
      if (!updated) return reply.status(403).send({ error: "Not found or not addressee" });
      return reply.send(updated);
    },
  });

  // Remove a friendship
  fastify.delete("/:id", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: "object", properties: { success: { type: "boolean" } } },
        401: errorObject,
        403: errorObject,
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { id } = request.params as { id: string };
      const result = await db
        .delete(friendshipsTable)
        .where(
          and(
            eq(friendshipsTable.id, id),
            or(eq(friendshipsTable.user_a_id, userId), eq(friendshipsTable.user_b_id, userId)),
          )
        )
        .returning();
      if (result.length === 0) return reply.status(403).send({ error: "Not found" });
      return reply.send({ success: true });
    },
  });
}

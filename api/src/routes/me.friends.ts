import { FastifyInstance } from "fastify";
import {
  db,
  friendshipsTable,
  friendRequestsTable,
  authUser,
  eq,
  ne,
  and,
  or,
  inArray,
} from "@klariti/database";
import { errorObject, successObject } from "../schemas/shared.schema";
import { friendUserObject, friendRequestObject, friendRequestUserObject, sentRequestUserObject } from "../schemas/friends.schema";

type Friendship = typeof friendshipsTable.$inferSelect;
type FriendRequest = typeof friendRequestsTable.$inferSelect;
type User = typeof authUser.$inferSelect;

function toFriendUser(f: Friendship, userId: string, users: User[]) {
  const friendId = f.user_a_id === userId ? f.user_b_id : f.user_a_id;
  const user = users.find((u) => u.id === friendId)!;
  return { friendship_id: f.id, id: user.id, name: user.name, email: user.email, image: user.image, createdAt: user.createdAt };
}

function toRequestUser(r: FriendRequest, otherId: string, users: User[]) {
  const user = users.find((u) => u.id === otherId)!;
  return { request_id: r.id, status: r.status, id: user.id, name: user.name, email: user.email, image: user.image, createdAt: user.createdAt };
}

export default async function friendsRoutes(fastify: FastifyInstance) {
  // List active friends
  fastify.get("/", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      response: { 200: { type: "array", items: friendUserObject }, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const friendships = await db
        .select()
        .from(friendshipsTable)
        .where(
          and(
            or(eq(friendshipsTable.user_a_id, userId), eq(friendshipsTable.user_b_id, userId)),
            eq(friendshipsTable.status, "active"),
          )
        );
      if (friendships.length === 0) return reply.send([]);
      const otherIds = friendships.map((f) => f.user_a_id === userId ? f.user_b_id : f.user_a_id);
      const users = await db.select().from(authUser).where(inArray(authUser.id, otherIds));
      return reply.send(friendships.map((f) => toFriendUser(f, userId, users)));
    },
  });

  // Requests I sent — declined/cancelled masked as pending (sender only sees pending|accepted)
  fastify.get("/requests/sent", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      response: { 200: { type: "array", items: sentRequestUserObject }, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const requests = await db
        .select()
        .from(friendRequestsTable)
        .where(
          and(
            eq(friendRequestsTable.from_id, userId),
            ne(friendRequestsTable.status, "accepted"),
          )
        );
      if (requests.length === 0) return reply.send([]);
      const users = await db.select().from(authUser).where(inArray(authUser.id, requests.map((r) => r.to_id)));
      return reply.send(requests.map((r) => {
        const user = users.find((u) => u.id === r.to_id)!;
        const status = r.status === "accepted" ? "accepted" : "pending";
        return { request_id: r.id, status, id: user.id, name: user.name, email: user.email, image: user.image, createdAt: user.createdAt };
      }));
    },
  });

  // Requests I received — full status shown
  fastify.get("/requests/received", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      response: { 200: { type: "array", items: friendRequestUserObject }, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const requests = await db
        .select()
        .from(friendRequestsTable)
        .where(
          and(
            eq(friendRequestsTable.to_id, userId),
            ne(friendRequestsTable.status, "accepted"),
          )
        );
      if (requests.length === 0) return reply.send([]);
      const users = await db.select().from(authUser).where(inArray(authUser.id, requests.map((r) => r.from_id)));
      return reply.send(requests.map((r) => toRequestUser(r, r.from_id, users)));
    },
  });

  // Send a friend request
  fastify.post<{ Body: { addressee_id: string } }>("/request", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["addressee_id"],
        properties: { addressee_id: { type: "string" } },
      },
      response: { 200: friendRequestObject, 400: errorObject, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { addressee_id } = request.body;
      if (userId === addressee_id) return reply.status(400).send({ error: "Cannot friend yourself" });

      // Check for an active friendship
      const [userA, userB] = userId < addressee_id ? [userId, addressee_id] : [addressee_id, userId];
      const [friendship] = await db
        .select()
        .from(friendshipsTable)
        .where(
          and(
            eq(friendshipsTable.user_a_id, userA),
            eq(friendshipsTable.user_b_id, userB),
            eq(friendshipsTable.status, "active"),
          )
        );
      if (friendship) return reply.status(400).send({ error: "Already friends" });

      // Check for an existing pending request in either direction
      const [existing] = await db
        .select()
        .from(friendRequestsTable)
        .where(
          and(
            or(
              and(eq(friendRequestsTable.from_id, userId), eq(friendRequestsTable.to_id, addressee_id)),
              and(eq(friendRequestsTable.from_id, addressee_id), eq(friendRequestsTable.to_id, userId)),
            ),
            ne(friendRequestsTable.status, "accepted"),
          )
        );
      if (existing) return reply.status(400).send({ error: "A pending request already exists" });

      const [req] = await db
        .insert(friendRequestsTable)
        .values({ from_id: userId, to_id: addressee_id })
        .returning();
      return reply.send(req);
    },
  });

  // Respond to a received request (accept or decline)
  // Respond to a request (recipient: accept/decline) or cancel it (sender: cancel)
  fastify.patch<{ Body: { action: "accept" | "decline" | "cancel" } }>("/requests/:requestId", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["action"],
        properties: { action: { type: "string", enum: ["accept", "decline", "cancel"] } },
      },
      response: { 200: friendRequestObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { requestId } = request.params as { requestId: string };
      const { action } = request.body;

      if (action === "cancel") {
        // Sender cancels their own pending request
        const [updated] = await db
          .update(friendRequestsTable)
          .set({ status: "cancelled", updated_at: new Date() })
          .where(
            and(
              eq(friendRequestsTable.id, requestId),
              eq(friendRequestsTable.from_id, userId),
              ne(friendRequestsTable.status, "accepted"),
            )
          )
          .returning();
        if (!updated) return reply.status(403).send({ error: "Not found or not the sender" });
        return reply.send(updated);
      }

      // Recipient accepts or declines
      const [updated] = await db
        .update(friendRequestsTable)
        .set({ status: action === "accept" ? "accepted" : "declined", updated_at: new Date() })
        .where(
          and(
            eq(friendRequestsTable.id, requestId),
            eq(friendRequestsTable.to_id, userId),
            ne(friendRequestsTable.status, "accepted"),
          )
        )
        .returning();
      if (!updated) return reply.status(403).send({ error: "Not found or not the recipient" });

      if (action === "accept") {
        // Upsert the canonical friendship row (creates or reactivates)
        const [userA, userB] = updated.from_id < updated.to_id
          ? [updated.from_id, updated.to_id]
          : [updated.to_id, updated.from_id];
        await db
          .insert(friendshipsTable)
          .values({ user_a_id: userA, user_b_id: userB, status: "active" })
          .onConflictDoUpdate({
            target: [friendshipsTable.user_a_id, friendshipsTable.user_b_id],
            set: { status: "active", updated_at: new Date() },
          });
      }

      return reply.send(updated);
    },
  });

  // Remove an active friendship (soft delete)
  fastify.delete("/:friendshipId", {
    schema: {
      tags: ["Friends"],
      security: [{ bearerAuth: [] }],
      response: { 200: successObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { friendshipId } = request.params as { friendshipId: string };
      const [updated] = await db
        .update(friendshipsTable)
        .set({ status: "removed", updated_at: new Date() })
        .where(
          and(
            eq(friendshipsTable.id, friendshipId),
            or(eq(friendshipsTable.user_a_id, userId), eq(friendshipsTable.user_b_id, userId)),
            eq(friendshipsTable.status, "active"),
          )
        )
        .returning();
      if (!updated) return reply.status(403).send({ error: "Not found" });
      return reply.send({ success: true });
    },
  });
}

import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  db,
  challengesTable,
  challengeParticipantsTable,
  challengeRequestsTable,
  friendshipsTable,
  eq,
  and,
  ne,
} from "@klariti/database";
import { errorObject, successObject } from "../schemas/shared.schema.js";
import { challengeObject, participantObject, challengeWithStatusObject, challengeRequestObject } from "../schemas/challenges.schema.js";

type Goal = "FOCUS" | "WORK" | "STUDY" | "CASUAL";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

declare module "fastify" {
  interface FastifyRequest {
    challenge?: typeof challengesTable.$inferSelect;
    participant?: typeof challengeParticipantsTable.$inferSelect;
    challengeRequest?: typeof challengeRequestsTable.$inferSelect;
  }
}

async function ensureChallengeCreator(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session!.user.id;
  const { id } = request.params as { id: string };
  if (!UUID_RE.test(id)) return reply.status(403).send({ error: "Not found or not creator" });
  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, id));
  if (!challenge || challenge.creator_id !== userId) {
    return reply.status(403).send({ error: "Not found or not creator" });
  }
  request.challenge = challenge;
}

async function ensureChallengeParticipant(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session!.user.id;
  const { id } = request.params as { id: string };
  if (!UUID_RE.test(id)) return reply.status(403).send({ error: "Not a participant" });
  const [row] = await db
    .select()
    .from(challengeParticipantsTable)
    .innerJoin(challengesTable, eq(challengeParticipantsTable.challenge_id, challengesTable.id))
    .where(and(
      eq(challengeParticipantsTable.challenge_id, id),
      eq(challengeParticipantsTable.user_id, userId),
    ));
  if (!row) return reply.status(403).send({ error: "Not a participant" });
  request.challenge = row.challenges;
  request.participant = row.challenge_participants;
}

async function ensureChallengeRecipient(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session!.user.id;
  const { requestId } = request.params as { requestId: string };
  const [req] = await db
    .select()
    .from(challengeRequestsTable)
    .where(and(eq(challengeRequestsTable.id, requestId), eq(challengeRequestsTable.status, "pending")));
  if (!req || req.to_id !== userId) {
    return reply.status(403).send({ error: "Not found or not the recipient" });
  }
  request.challengeRequest = req;
}

async function ensureChallengeSender(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session!.user.id;
  const { requestId } = request.params as { requestId: string };
  const [req] = await db
    .select()
    .from(challengeRequestsTable)
    .where(eq(challengeRequestsTable.id, requestId));
  if (!req || req.from_id !== userId) {
    return reply.status(403).send({ error: "Not found or not the sender" });
  }
  if (req.status !== "pending") {
    return reply.status(403).send({ error: "Request is no longer pending" });
  }
  request.challengeRequest = req;
}

export default async function challengesRoutes(fastify: FastifyInstance) {
  // List challenges the user participates in
  fastify.get("/", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: "array", items: challengeWithStatusObject },
        401: errorObject,
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const rows = await db
        .select()
        .from(challengeParticipantsTable)
        .innerJoin(challengesTable, eq(challengeParticipantsTable.challenge_id, challengesTable.id))
        .where(eq(challengeParticipantsTable.user_id, userId));
      return reply.send(
        rows.map(({ challenges, challenge_participants }) => ({
          ...challenges,
          participant_status: challenge_participants.status,
          joined_at: challenge_participants.joined_at,
        }))
      );
    },
  });

  // Create a challenge — creator is auto-enrolled as active participant
  fastify.post<{ Body: { name: string; goal: Goal; ends_at?: string; pause_threshold?: number } }>("/", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["name", "goal"],
        properties: {
          name: { type: "string" },
          goal: { type: "string", enum: ["FOCUS", "WORK", "STUDY", "CASUAL"] },
          ends_at: { type: "string", format: "date-time" },
          pause_threshold: { type: "number" },
        },
      },
      response: { 200: challengeObject, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { name, goal, ends_at, pause_threshold } = request.body;
      const [challenge] = await db
        .insert(challengesTable)
        .values({
          creator_id: userId,
          name,
          goal,
          ends_at: ends_at ? new Date(ends_at) : null,
          pause_threshold: pause_threshold ?? null,
        })
        .returning();
      await db.insert(challengeParticipantsTable).values({
        challenge_id: challenge.id,
        user_id: userId,
        status: "active",
        joined_at: new Date(),
      });
      return reply.send(challenge);
    },
  });

  // Get a single challenge (must be a participant)
  fastify.get("/:id", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      response: { 200: challengeObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession, ensureChallengeParticipant],
    handler: async (request, reply) => {
      return reply.send(request.challenge!);
    },
  });

  // Update a challenge (creator only)
  fastify.put<{ Body: { name?: string; goal?: Goal; ends_at?: string | null; pause_threshold?: number | null } }>("/:id", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          goal: { type: "string", enum: ["FOCUS", "WORK", "STUDY", "CASUAL"] },
          ends_at: { type: "string", format: "date-time", nullable: true },
          pause_threshold: { type: "number", nullable: true },
        },
      },
      response: { 200: challengeObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession, ensureChallengeCreator],
    handler: async (request, reply) => {
      const { name, goal, ends_at, pause_threshold } = request.body;
      const [updated] = await db
        .update(challengesTable)
        .set({
          name: name ?? undefined,
          goal: goal ?? undefined,
          ends_at: ends_at !== undefined ? (ends_at ? new Date(ends_at) : null) : undefined,
          pause_threshold: pause_threshold !== undefined ? pause_threshold : undefined,
          updated_at: new Date(),
        })
        .where(eq(challengesTable.id, request.challenge!.id))
        .returning();
      return reply.send(updated);
    },
  });

  // Delete a challenge (creator only)
  fastify.delete("/:id", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      response: { 200: successObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession, ensureChallengeCreator],
    handler: async (request, reply) => {
      await db.delete(challengesTable).where(eq(challengesTable.id, request.challenge!.id));
      return reply.send({ success: true });
    },
  });

  // Invite a friend to a challenge (creator only, must be friends with invitee)
  fastify.post<{ Body: { user_id: string } }>("/:id/invite", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["user_id"],
        properties: { user_id: { type: "string" } },
      },
      response: { 200: challengeRequestObject, 400: errorObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession, ensureChallengeCreator],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { user_id: inviteeId } = request.body;
      const challenge = request.challenge!;

      const [userA, userB] = userId < inviteeId ? [userId, inviteeId] : [inviteeId, userId];
      const [friendship] = await db
        .select()
        .from(friendshipsTable)
        .where(and(
          eq(friendshipsTable.user_a_id, userA),
          eq(friendshipsTable.user_b_id, userB),
          eq(friendshipsTable.status, "active"),
        ));
      if (!friendship) return reply.status(403).send({ error: "Not friends with this user" });

      const [existingParticipant] = await db
        .select()
        .from(challengeParticipantsTable)
        .where(and(
          eq(challengeParticipantsTable.challenge_id, challenge.id),
          eq(challengeParticipantsTable.user_id, inviteeId),
        ));
      if (existingParticipant) return reply.status(400).send({ error: "User is already a participant" });

      const [pendingReq] = await db
        .select()
        .from(challengeRequestsTable)
        .where(and(
          eq(challengeRequestsTable.challenge_id, challenge.id),
          eq(challengeRequestsTable.to_id, inviteeId),
          eq(challengeRequestsTable.status, "pending"),
        ));
      if (pendingReq) return reply.status(400).send({ error: "A pending invite already exists" });

      const [req] = await db
        .insert(challengeRequestsTable)
        .values({ challenge_id: challenge.id, from_id: userId, to_id: inviteeId })
        .returning();
      return reply.send(req);
    },
  });

  // Withdraw a sent challenge invite (sender/creator only)
  fastify.delete("/requests/:requestId", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      response: { 200: challengeRequestObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession, ensureChallengeSender],
    handler: async (request, reply) => {
      const [updated] = await db
        .update(challengeRequestsTable)
        .set({ status: "withdrawn", updated_at: new Date() })
        .where(eq(challengeRequestsTable.id, request.challengeRequest!.id))
        .returning();
      return reply.send(updated);
    },
  });

  // List pending challenge invites received by the current user
  fastify.get("/requests/received", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      response: { 200: { type: "array", items: challengeRequestObject }, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const reqs = await db
        .select()
        .from(challengeRequestsTable)
        .where(and(
          eq(challengeRequestsTable.to_id, userId),
          eq(challengeRequestsTable.status, "pending"),
        ));
      return reply.send(reqs);
    },
  });

  // List challenge invites sent by the current user (excluding accepted)
  fastify.get("/requests/sent", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      response: { 200: { type: "array", items: challengeRequestObject }, 401: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const reqs = await db
        .select()
        .from(challengeRequestsTable)
        .where(and(
          eq(challengeRequestsTable.from_id, userId),
          ne(challengeRequestsTable.status, "accepted"),
        ));
      return reply.send(reqs);
    },
  });

  // Respond to a challenge invite (recipient: accept, decline, or ignore)
  fastify.patch<{ Body: { action: "accept" | "decline" | "ignore" } }>("/requests/:requestId", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["action"],
        properties: { action: { type: "string", enum: ["accept", "decline", "ignore"] } },
      },
      response: { 200: challengeRequestObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession, ensureChallengeRecipient],
    handler: async (request, reply) => {
      const { action } = request.body;
      const req = request.challengeRequest!;
      const userId = request.session!.user.id;
      const [updated] = await db
        .update(challengeRequestsTable)
        .set({
          status: action === "accept" ? "accepted" : action === "decline" ? "declined" : "ignored",
          updated_at: new Date(),
        })
        .where(eq(challengeRequestsTable.id, req.id))
        .returning();
      if (action === "accept") {
        await db.insert(challengeParticipantsTable).values({
          challenge_id: req.challenge_id,
          user_id: userId,
          status: "active",
          joined_at: new Date(),
        });
      }
      return reply.send(updated);
    },
  });

  // Pause or resume own participation
  fastify.patch<{ Body: { status: "active" | "paused" } }>("/:id/status", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: ["active", "paused"] } },
      },
      response: { 200: participantObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession, ensureChallengeParticipant],
    handler: async (request, reply) => {
      const { status } = request.body;
      const [updated] = await db
        .update(challengeParticipantsTable)
        .set({ status })
        .where(and(
          eq(challengeParticipantsTable.challenge_id, request.challenge!.id),
          eq(challengeParticipantsTable.user_id, request.session!.user.id),
        ))
        .returning();
      return reply.send(updated);
    },
  });
}

import { FastifyInstance } from "fastify";
import {
  db,
  challengesTable,
  challengeParticipantsTable,
  friendshipsTable,
  eq,
  and,
  ne,
} from "@klariti/database";
import { errorObject, successObject } from "../schemas/shared.schema";
import { challengeObject, participantObject, challengeWithStatusObject } from "../schemas/challenges.schema";

type Goal = "FOCUS" | "WORK" | "STUDY" | "CASUAL";

export default async function challengesRoutes(fastify: FastifyInstance) {
  // List challenges the user participates in (excluding declined)
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
        .where(
          and(
            eq(challengeParticipantsTable.user_id, userId),
            ne(challengeParticipantsTable.status, "declined"),
          )
        );
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
      response: { 200: challengeObject, 401: errorObject, 404: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { id } = request.params as { id: string };
      const [row] = await db
        .select()
        .from(challengeParticipantsTable)
        .innerJoin(challengesTable, eq(challengeParticipantsTable.challenge_id, challengesTable.id))
        .where(and(eq(challengeParticipantsTable.user_id, userId), eq(challengesTable.id, id)));
      if (!row) return reply.status(404).send({ error: "Not found" });
      return reply.send(row.challenges);
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
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { id } = request.params as { id: string };
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
        .where(and(eq(challengesTable.id, id), eq(challengesTable.creator_id, userId)))
        .returning();
      if (!updated) return reply.status(403).send({ error: "Not found or not creator" });
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
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { id } = request.params as { id: string };
      const result = await db
        .delete(challengesTable)
        .where(and(eq(challengesTable.id, id), eq(challengesTable.creator_id, userId)))
        .returning();
      if (result.length === 0) return reply.status(403).send({ error: "Not found or not creator" });
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
      response: { 200: participantObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { id } = request.params as { id: string };
      const { user_id: inviteeId } = request.body;

      const [challenge] = await db
        .select()
        .from(challengesTable)
        .where(and(eq(challengesTable.id, id), eq(challengesTable.creator_id, userId)));
      if (!challenge) return reply.status(403).send({ error: "Not found or not creator" });

      const [userA, userB] = userId < inviteeId ? [userId, inviteeId] : [inviteeId, userId];
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
      if (!friendship) return reply.status(403).send({ error: "Not friends with this user" });

      const [participant] = await db
        .insert(challengeParticipantsTable)
        .values({ challenge_id: id, user_id: inviteeId, status: "invited" })
        .onConflictDoNothing()
        .returning();
      return reply.send(participant ?? { error: "Already invited" });
    },
  });

  // Accept or decline a challenge invitation
  fastify.post<{ Body: { accept: boolean } }>("/:id/respond", {
    schema: {
      tags: ["Challenges"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["accept"],
        properties: { accept: { type: "boolean" } },
      },
      response: { 200: participantObject, 401: errorObject, 404: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { id } = request.params as { id: string };
      const { accept } = request.body;
      const [updated] = await db
        .update(challengeParticipantsTable)
        .set({
          status: accept ? "active" : "declined",
          joined_at: accept ? new Date() : null,
        })
        .where(
          and(
            eq(challengeParticipantsTable.challenge_id, id),
            eq(challengeParticipantsTable.user_id, userId),
            eq(challengeParticipantsTable.status, "invited"),
          )
        )
        .returning();
      if (!updated) return reply.status(404).send({ error: "No pending invitation found" });
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
      response: { 200: participantObject, 401: errorObject, 404: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { id } = request.params as { id: string };
      const { status } = request.body;
      const [updated] = await db
        .update(challengeParticipantsTable)
        .set({ status })
        .where(
          and(
            eq(challengeParticipantsTable.challenge_id, id),
            eq(challengeParticipantsTable.user_id, userId),
          )
        )
        .returning();
      if (!updated) return reply.status(404).send({ error: "Not a participant" });
      return reply.send(updated);
    },
  });
}

import {
  db,
  authUser,
  challengesTable,
  challengeParticipantsTable,
  challengeRequestsTable,
  friendshipsTable,
  eq,
  and,
  ne,
  or,
} from "@klariti/database";
import type { CreateChallengeBody, UpdateChallengeBody } from "@klariti/contracts";

export const challengesRepository = {
  listForUser: (userId: string) =>
    db
      .select({
        id: challengesTable.id,
        creator_id: challengesTable.creator_id,
        creator_name: authUser.name,
        name: challengesTable.name,
        goal: challengesTable.goal,
        ends_at: challengesTable.ends_at,
        pause_threshold: challengesTable.pause_threshold,
        created_at: challengesTable.created_at,
        updated_at: challengesTable.updated_at,
        participant_status: challengeParticipantsTable.status,
        joined_at: challengeParticipantsTable.joined_at,
      })
      .from(challengeParticipantsTable)
      .innerJoin(challengesTable, eq(challengeParticipantsTable.challenge_id, challengesTable.id))
      .innerJoin(authUser, eq(challengesTable.creator_id, authUser.id))
      .where(eq(challengeParticipantsTable.user_id, userId)),

  findById: (id: string) =>
    db.select().from(challengesTable).where(eq(challengesTable.id, id)),

  findParticipant: (challengeId: string, userId: string) =>
    db
      .select()
      .from(challengeParticipantsTable)
      .innerJoin(challengesTable, eq(challengeParticipantsTable.challenge_id, challengesTable.id))
      .where(and(
        eq(challengeParticipantsTable.challenge_id, challengeId),
        eq(challengeParticipantsTable.user_id, userId),
      )),

  create: (data: { creator_id: string } & CreateChallengeBody) =>
    db
      .insert(challengesTable)
      .values({
        creator_id: data.creator_id,
        name: data.name,
        goal: data.goal,
        ends_at: data.ends_at ? new Date(data.ends_at) : null,
        pause_threshold: data.pause_threshold ?? null,
      })
      .returning(),

  update: (id: string, data: UpdateChallengeBody) =>
    db
      .update(challengesTable)
      .set({
        name: data.name ?? undefined,
        goal: data.goal ?? undefined,
        ends_at: data.ends_at !== undefined ? (data.ends_at ? new Date(data.ends_at) : null) : undefined,
        pause_threshold: data.pause_threshold !== undefined ? data.pause_threshold : undefined,
        updated_at: new Date(),
      })
      .where(eq(challengesTable.id, id))
      .returning(),

  delete: (id: string) =>
    db.delete(challengesTable).where(eq(challengesTable.id, id)),

  addParticipant: (challengeId: string, userId: string) =>
    db.insert(challengeParticipantsTable).values({
      challenge_id: challengeId,
      user_id: userId,
      status: "active",
      joined_at: new Date(),
    }),

  removeParticipant: (challengeId: string, userId: string) =>
    db.delete(challengeParticipantsTable).where(and(
      eq(challengeParticipantsTable.challenge_id, challengeId),
      eq(challengeParticipantsTable.user_id, userId),
    )),

  updateParticipantStatus: (challengeId: string, userId: string, status: "active" | "paused") =>
    db
      .update(challengeParticipantsTable)
      .set({ status })
      .where(and(
        eq(challengeParticipantsTable.challenge_id, challengeId),
        eq(challengeParticipantsTable.user_id, userId),
      ))
      .returning(),

  findActiveFriendship: (userA: string, userB: string) =>
    db
      .select()
      .from(friendshipsTable)
      .where(and(
        eq(friendshipsTable.user_a_id, userA),
        eq(friendshipsTable.user_b_id, userB),
        eq(friendshipsTable.status, "active"),
      )),

  findExistingParticipant: (challengeId: string, userId: string) =>
    db
      .select()
      .from(challengeParticipantsTable)
      .where(and(
        eq(challengeParticipantsTable.challenge_id, challengeId),
        eq(challengeParticipantsTable.user_id, userId),
      )),

  findPendingInvite: (challengeId: string, toId: string) =>
    db
      .select()
      .from(challengeRequestsTable)
      .where(and(
        eq(challengeRequestsTable.challenge_id, challengeId),
        eq(challengeRequestsTable.to_id, toId),
        eq(challengeRequestsTable.status, "pending"),
      )),

  createRequest: (challengeId: string, fromId: string, toId: string) =>
    db
      .insert(challengeRequestsTable)
      .values({ challenge_id: challengeId, from_id: fromId, to_id: toId })
      .returning(),

  findRequest: (requestId: string) =>
    db.select().from(challengeRequestsTable).where(eq(challengeRequestsTable.id, requestId)),

  findPendingRequest: (requestId: string) =>
    db
      .select()
      .from(challengeRequestsTable)
      .where(and(
        eq(challengeRequestsTable.id, requestId),
        eq(challengeRequestsTable.status, "pending"),
      )),

  updateRequest: (requestId: string, status: "accepted" | "declined" | "withdrawn" | "ignored") =>
    db
      .update(challengeRequestsTable)
      .set({ status, updated_at: new Date() })
      .where(eq(challengeRequestsTable.id, requestId))
      .returning(),

  listReceivedRequests: (userId: string) =>
    db
      .select()
      .from(challengeRequestsTable)
      .where(and(
        eq(challengeRequestsTable.to_id, userId),
        eq(challengeRequestsTable.status, "pending"),
      )),

  listSentRequests: (userId: string) =>
    db
      .select()
      .from(challengeRequestsTable)
      .where(and(
        eq(challengeRequestsTable.from_id, userId),
        ne(challengeRequestsTable.status, "accepted"),
      )),
};

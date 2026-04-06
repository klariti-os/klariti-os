import {
  db,
  authUser,
  friendshipsTable,
  friendRequestsTable,
  eq,
  ne,
  and,
  or,
  inArray,
} from "@klariti/database";

export const friendsRepository = {
  listActiveFriendships: (userId: string) =>
    db
      .select()
      .from(friendshipsTable)
      .where(and(
        or(eq(friendshipsTable.user_a_id, userId), eq(friendshipsTable.user_b_id, userId)),
        eq(friendshipsTable.status, "active"),
      )),

  listSentRequests: (userId: string) =>
    db
      .select()
      .from(friendRequestsTable)
      .where(and(
        eq(friendRequestsTable.from_id, userId),
        ne(friendRequestsTable.status, "accepted"),
      )),

  listReceivedRequests: (userId: string) =>
    db
      .select()
      .from(friendRequestsTable)
      .where(and(
        eq(friendRequestsTable.to_id, userId),
        eq(friendRequestsTable.status, "pending"),
      )),

  findUsersByIds: (ids: string[]) =>
    db.select().from(authUser).where(inArray(authUser.id, ids)),

  findActiveFriendship: (userA: string, userB: string) =>
    db
      .select()
      .from(friendshipsTable)
      .where(and(
        eq(friendshipsTable.user_a_id, userA),
        eq(friendshipsTable.user_b_id, userB),
        eq(friendshipsTable.status, "active"),
      )),

  findPendingRequest: (fromId: string, toId: string) =>
    db
      .select()
      .from(friendRequestsTable)
      .where(and(
        or(
          and(eq(friendRequestsTable.from_id, fromId), eq(friendRequestsTable.to_id, toId)),
          and(eq(friendRequestsTable.from_id, toId), eq(friendRequestsTable.to_id, fromId)),
        ),
        eq(friendRequestsTable.status, "pending"),
      )),

  createRequest: (fromId: string, toId: string) =>
    db
      .insert(friendRequestsTable)
      .values({ from_id: fromId, to_id: toId })
      .returning(),

  findRequestById: (requestId: string) =>
    db.select().from(friendRequestsTable).where(eq(friendRequestsTable.id, requestId)),

  findPendingRequestById: (requestId: string) =>
    db
      .select()
      .from(friendRequestsTable)
      .where(and(
        eq(friendRequestsTable.id, requestId),
        eq(friendRequestsTable.status, "pending"),
      )),

  updateRequest: (requestId: string, status: "accepted" | "declined" | "withdrawn") =>
    db
      .update(friendRequestsTable)
      .set({ status, updated_at: new Date() })
      .where(eq(friendRequestsTable.id, requestId))
      .returning(),

  upsertFriendship: (userA: string, userB: string) =>
    db
      .insert(friendshipsTable)
      .values({ user_a_id: userA, user_b_id: userB, status: "active" })
      .onConflictDoUpdate({
        target: [friendshipsTable.user_a_id, friendshipsTable.user_b_id],
        set: { status: "active", updated_at: new Date() },
      }),

  removeFriendship: (friendshipId: string, userId: string) =>
    db
      .update(friendshipsTable)
      .set({ status: "removed", updated_at: new Date() })
      .where(and(
        eq(friendshipsTable.id, friendshipId),
        or(eq(friendshipsTable.user_a_id, userId), eq(friendshipsTable.user_b_id, userId)),
        eq(friendshipsTable.status, "active"),
      ))
      .returning(),
};

import { boolean, integer, index, pgEnum, pgTable, primaryKey, real, text, timestamp, unique, uuid, varchar, } from "drizzle-orm/pg-core";
// ─── Better Auth tables ───────────────────────────────────────────────────────
export const authUser = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    // Better Auth admin plugin fields
    role: text("role").default("user"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
});
export const authSession = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
});
export const authAccount = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});
export const authVerification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});
// ─── Application tables ───────────────────────────────────────────────────────
export const goalEnum = pgEnum("goal", ["FOCUS", "WORK", "STUDY", "CASUAL"]);
export const friendshipStateEnum = pgEnum("friendship_state", ["active", "removed"]);
export const friendRequestStatusEnum = pgEnum("friend_request_status", ["pending", "accepted", "declined", "cancelled", "withdrawn"]);
export const participantStatusEnum = pgEnum("participant_status", ["active", "paused", "completed"]);
export const challengeRequestStatusEnum = pgEnum("challenge_request_status", ["pending", "accepted", "declined", "withdrawn", "ignored"]);
export const ktagStatusEnum = pgEnum("ktag_status", ["active", "revoked"]);
export const ktagTypeEnum = pgEnum("ktag_type", ["WALL", "MOBILE", "DESK"]);
// A challenge is the canonical entity. A solo "intent" is just a challenge with one participant.
export const challengesTable = pgTable("challenges", {
    id: uuid("id").primaryKey().defaultRandom(),
    creator_id: text("creator_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    goal: goalEnum("goal").notNull(),
    ends_at: timestamp("ends_at", { withTimezone: true }), // set = time-bound
    pause_threshold: real("pause_threshold"), // set = group pause mechanic
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [index("challenges_creator_id_idx").on(table.creator_id)]);
// One row per (challenge, user). Composite PK — a user can only join a challenge once.
export const challengeParticipantsTable = pgTable("challenge_participants", {
    challenge_id: uuid("challenge_id")
        .notNull()
        .references(() => challengesTable.id, { onDelete: "cascade" }),
    user_id: text("user_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    status: participantStatusEnum("status").notNull().default("active"),
    joined_at: timestamp("joined_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
    primaryKey({ columns: [table.challenge_id, table.user_id] }),
    index("challenge_participants_user_id_idx").on(table.user_id),
]);
// Each challenge invite is a distinct row. Accepting creates a participant row.
export const challengeRequestsTable = pgTable("challenge_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    challenge_id: uuid("challenge_id")
        .notNull()
        .references(() => challengesTable.id, { onDelete: "cascade" }),
    from_id: text("from_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    to_id: text("to_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    status: challengeRequestStatusEnum("status").notNull().default("pending"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
    index("challenge_requests_challenge_id_idx").on(table.challenge_id),
    index("challenge_requests_from_idx").on(table.from_id),
    index("challenge_requests_to_idx").on(table.to_id),
]);
// Canonical relationship between two users. user_a_id < user_b_id enforced at application layer.
// Persists across friend/unfriend cycles via status instead of deletion.
export const friendshipsTable = pgTable("friendships", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_a_id: text("user_a_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    user_b_id: text("user_b_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    status: friendshipStateEnum("status").notNull().default("active"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
    unique("friendships_pair_unique").on(table.user_a_id, table.user_b_id),
    index("friendships_user_a_idx").on(table.user_a_id),
    index("friendships_user_b_idx").on(table.user_b_id),
]);
// Each friend request is a distinct row. Accepting creates/reactivates a friendship row.
export const friendRequestsTable = pgTable("friend_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    from_id: text("from_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    to_id: text("to_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    status: friendRequestStatusEnum("status").notNull().default("pending"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
    index("friend_requests_from_idx").on(table.from_id),
    index("friend_requests_to_idx").on(table.to_id),
]);
export const ktagsTable = pgTable("ktags", {
    // The unique Klariti tag ID used in the tag URL/message.
    tag_id: varchar("tag_id", { length: 255 }).primaryKey(),
    // Hash of the NFC tag's hardware UID as read during provisioning.
    uid_hash: varchar("uid_hash", { length: 128 }),
    // Full URL payload as written to the NFC tag. This is the message on the tag.
    payload: varchar("payload", { length: 1024 }).notNull(),
    // Server-produced signature binding the payload / tag ID to the tag identity.
    signature: varchar("signature", { length: 512 }),
    // Signature format / key version used when generating the signature.
    sig_version: integer("sig_version"),
    status: ktagStatusEnum("status").notNull().default("active"),
    owner_id: text("owner_id")
        .references(() => authUser.id, { onDelete: "set null" }),
    label: varchar("label", { length: 255 }),
    tag_type: ktagTypeEnum("tag_type"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [
    index("ktags_owner_id_idx").on(table.owner_id),
    index("ktags_status_idx").on(table.status),
    unique("ktags_uid_hash_unique").on(table.uid_hash),
]);
export const connectedDevicesTable = pgTable("connected_devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id")
        .notNull()
        .references(() => authUser.id, { onDelete: "cascade" }),
    device_name: varchar("device_name", { length: 255 }).notNull(),
    device_fingerprint: varchar("device_fingerprint", { length: 512 })
        .notNull()
        .unique(),
    last_sync_at: timestamp("last_sync_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

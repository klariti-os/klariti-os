import {
  boolean,
  index,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Better Auth tables ───────────────────────────────────────────────────────

export const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
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

export const intentsTable = pgTable(
  "intents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    goal: goalEnum("goal").notNull(),
    is_active: boolean("is_active").notNull().default(false),
    ends_at: timestamp("ends_at", { withTimezone: true }),
    pause_threshold: real("pause_threshold"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("intents_user_id_idx").on(table.user_id)]
);


export const ktagsTable = pgTable(
  "ktags",
  {
    // The unique ID embedded in the tag URL: klariti.so/tag/<embedded_id>
    embedded_id: varchar("embedded_id", { length: 255 }).primaryKey(),
    // Full payload URL as written to the NFC tag
    payload: varchar("payload", { length: 512 }).notNull(),
    user_id: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 255 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("ktags_user_id_idx").on(table.user_id)]
);

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

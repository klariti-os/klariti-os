import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
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

export const profilesTable = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    age: integer("age"),
    is_active: boolean("is_active").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("profiles_user_id_idx").on(table.user_id)]
);

export const ruleTypeEnum = pgEnum("rule_type", [
  "BLOCK",
  "BLUR",
  "DELAY",
  "HIGHLIGHT",
]);

export const userPreferencesTable = pgTable("user_preferences", {
  user_id: text("user_id")
    .primaryKey()
    .references(() => authUser.id, { onDelete: "cascade" }),
  global_kill_switch_enabled: boolean("global_kill_switch_enabled")
    .notNull()
    .default(false),
  default_profile_id: uuid("default_profile_id").references(
    () => profilesTable.id,
    { onDelete: "set null" }
  ),
  sync_enabled: boolean("sync_enabled").notNull().default(false),
  preferences: jsonb("preferences").$type<Record<string, unknown>>(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

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

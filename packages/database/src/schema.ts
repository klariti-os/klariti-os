import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// User id must be UUID so profiles, user_preferences, connected_devices can reference it
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const profilesTable = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // e.g. "Study", "Casual", "Work"
  is_active: boolean("is_active").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const ruleTypeEnum = pgEnum("rule_type", [
  "BLOCK",
  "BLUR",
  "DELAY",
  "HIGHLIGHT",
]);

export const rulesTable = pgTable("rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  profile_id: uuid("profile_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  rule_type: ruleTypeEnum("rule_type").notNull(),
  condition: jsonb("condition").$type<Record<string, unknown>>().notNull(), // domain patterns, keywords, time-based
  action_config: jsonb("action_config").$type<Record<string, unknown>>().notNull(), // what to hide/blur, duration, etc.
  priority: integer("priority").notNull(),
  is_enabled: boolean("is_enabled").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userPreferencesTable = pgTable("user_preferences", {
  user_id: uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  global_kill_switch_enabled: boolean("global_kill_switch_enabled")
    .notNull()
    .default(false),
  default_profile_id: uuid("default_profile_id").references(
    () => profilesTable.id,
    { onDelete: "set null" }
  ),
  sync_enabled: boolean("sync_enabled").notNull().default(false),
  preferences: jsonb("preferences").$type<Record<string, unknown>>(), // flexible additional settings
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const connectedDevicesTable = pgTable("connected_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  device_name: varchar("device_name", { length: 255 }).notNull(),
  device_fingerprint: varchar("device_fingerprint", { length: 512 })
    .notNull()
    .unique(),
  last_sync_at: timestamp("last_sync_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

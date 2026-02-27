import "dotenv/config";
import { defineConfig } from "drizzle-kit";

config({ path: "../../.env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});

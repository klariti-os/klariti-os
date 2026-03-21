import "dotenv/config";
import { Pool } from "pg";
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<Record<string, never>> & {
    $client: Pool;
};

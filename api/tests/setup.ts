import { config } from "dotenv";
import { resolve } from "path";

// Load root .env before any module imports the database
config({ path: resolve(__dirname, "../../.env") });

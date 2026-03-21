import { config } from "dotenv";
import { generateKeyPairSync } from "node:crypto";
import { resolve } from "path";

// Load root .env before any module imports the database
config({ path: resolve(__dirname, "../../.env") });

if (!process.env.KTAG_SIGNING_PRIVATE_KEY) {
  const { privateKey } = generateKeyPairSync("ed25519");
  process.env.KTAG_SIGNING_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
}

process.env.KTAG_SIG_VERSION ??= "1";
process.env.KTAG_BASE_URL ??= "https://klariti.so";

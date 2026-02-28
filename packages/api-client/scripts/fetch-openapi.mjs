#!/usr/bin/env node

/**
 * Fetches the OpenAPI spec from the running Klariti API server
 * and writes it to openapi.json for code generation.
 *
 * Usage:
 *   node scripts/fetch-openapi.mjs                        # defaults to http://localhost:4200
 *   API_URL=https://api.klariti.com node scripts/fetch-openapi.mjs
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_URL = process.env.API_URL ?? "http://localhost:4200";
const SPEC_URL = `${API_URL}/docs/json`;
const OUTPUT = resolve(__dirname, "..", "openapi.json");

async function main() {
  console.log(`Fetching OpenAPI spec from ${SPEC_URL}...`);

  const res = await fetch(SPEC_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}\n` +
        `Make sure the API server is running at ${API_URL}`
    );
  }

  const spec = await res.json();
  writeFileSync(OUTPUT, JSON.stringify(spec, null, 2) + "\n");
  console.log(`OpenAPI spec written to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

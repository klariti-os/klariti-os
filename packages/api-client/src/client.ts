/**
 * Re-export the generated client and its configuration helper.
 * The client is bundled directly by @hey-api/openapi-ts — no separate
 * runtime dependency is needed.
 *
 * @example
 * ```ts
 * import { client } from "@klariti/api-client";
 *
 * client.setConfig({
 *   baseUrl: "https://api.klariti.com",
 *   headers: { Authorization: `Bearer ${token}` },
 * });
 * ```
 */
export { client } from "./generated/client.gen";

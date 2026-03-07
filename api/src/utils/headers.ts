import { FastifyRequest } from "fastify";

/** Convert Fastify's incoming headers to a Web-standard Headers object. */
export function toWebHeaders(
  headers: FastifyRequest["headers"],
): Headers {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      webHeaders.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return webHeaders;
}

import { buildApp as createApp } from "../../src/factory.js";

export function buildApp() {
  return createApp({
    includeSwagger: false,
    logger: false,
  });
}

import { buildApp as createApp } from "../../src/app.js";

export function buildApp() {
  return createApp({
    includeSwagger: false,
    logger: false,
  });
}

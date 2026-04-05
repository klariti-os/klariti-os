import Fastify from "fastify";
import fp from "fastify-plugin";
import app from "../../src/app.js";

export function buildApp() {
  const fastify = Fastify({
    logger: false,
    routerOptions: { maxParamLength: 1024 },
    ajv: { customOptions: { removeAdditional: false } },
  });
  fastify.register(fp(app), { includeSwagger: false });
  return fastify;
}

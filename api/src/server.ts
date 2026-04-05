import Fastify from "fastify";
import fp from "fastify-plugin";
import { config } from "./config.js";
import app from "./app.js";

const fastify = Fastify({
  routerOptions: {
    maxParamLength: 1024,
  },
  ajv: {
    customOptions: {
      removeAdditional: false,
    },
  },
  logger: process.stdout.isTTY
    ? { transport: { target: "pino-pretty" } }
    : true,
});

async function init() {
  await fastify.register(fp(app));

  try {
    await fastify.listen({ port: config.port, host: config.host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close();
    process.exit(0);
  });
});

init();

export default fastify;

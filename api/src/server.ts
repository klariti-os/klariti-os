import { config } from "./config.js";
import { buildApp } from "./factory.js";

const usePrettyLogger = process.env.NODE_ENV !== "production" && Boolean(process.stdout.isTTY);

const fastify = buildApp({
  logger: usePrettyLogger
    ? { transport: { target: "pino-pretty" } }
    : true,
});

async function main() {
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

main();

export default fastify;

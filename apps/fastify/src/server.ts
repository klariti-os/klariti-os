import Fastify from "fastify";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

fastify.get("/", function (request, reply) {
  reply.send({ Message: "hello from Klariti" });
});

async function main() {
  try {
    await fastify.listen({ port: 4269, host: "localhost" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();

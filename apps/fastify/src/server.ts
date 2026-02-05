import Fastify from "fastify";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

fastify.get("/", async (request, reply) => {
  reply.send({ message: "hello from Klariti" });
});

async function main() {
  try {
    await fastify.listen({ port: 5001, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err); 
    process.exit(1); 
  }
}

main();

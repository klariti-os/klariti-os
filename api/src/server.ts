import Fastify, { FastifyReply, FastifyRequest } from "fastify";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

fastify.get("/favicon.ico", async (req, reply) => {
  reply.redirect("https://agentic-house.vercel.app/favicons/favicon.ico");
});

fastify.get("/", async (request, reply) => {
  reply.send({ message: "hello from Klariti" });
});

fastify.post("/api/users", {
  handler: async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body;

    console.log({ body });

    return reply.code(201).send(body);
  },
});

async function main() {
  try {
    await fastify.listen({ port: 4200, host: "0.0.0.0" });  
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

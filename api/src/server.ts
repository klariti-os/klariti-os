import Fastify, { FastifyReply, FastifyRequest } from "fastify";

import userRoutes from "./postExample";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

fastify.register(userRoutes, {prefix: "api/users"})

fastify.get("/favicon.ico", async (req, reply) => {
  reply.redirect("https://agentic-house.vercel.app/favicons/favicon.ico");
});

fastify.get("/", async (request, reply) => {
  reply.send({ message: "hello from Klariti" });
});


fastify.get("/random/:n", async (request, reply) => {
  const { n } = request.params as { n: string };
  const random = Math.floor(Math.random() * parseInt(n)) + 1;
  return { random };
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

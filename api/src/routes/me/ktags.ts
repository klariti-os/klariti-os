import { FastifyInstance } from "fastify";
import { db, ktagsTable, eq, and } from "@klariti/database";
import { errorObject } from "../../schemas/shared.schema";
import { ktagObject } from "../../schemas/ktags.schema";

export default async function meKtagsRoutes(fastify: FastifyInstance) {
  // List own ktags
  fastify.get("/", {
    schema: {
      tags: ["Me"],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: "array", items: ktagObject },
        401: errorObject,
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const rows = await db.select().from(ktagsTable).where(eq(ktagsTable.user_id, userId));
      return reply.send(rows);
    },
  });

  // Update own ktag label
  fastify.patch<{ Body: { label: string | null } }>("/:embedded_id", {
    schema: {
      tags: ["Me"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["label"],
        properties: { label: { type: "string", nullable: true } },
      },
      response: { 200: ktagObject, 401: errorObject, 404: errorObject },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { embedded_id } = request.params as { embedded_id: string };
      const { label } = request.body;
      const [updated] = await db
        .update(ktagsTable)
        .set({ label })
        .where(and(eq(ktagsTable.embedded_id, embedded_id), eq(ktagsTable.user_id, userId)))
        .returning();
      if (!updated) return reply.status(404).send({ error: "KTag not found." });
      return reply.send(updated);
    },
  });
}

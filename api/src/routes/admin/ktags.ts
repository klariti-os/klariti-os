import { FastifyInstance } from "fastify";
import { db, ktagsTable, eq } from "@klariti/database";

const ktagResponseSchema = {
  type: "object",
  properties: {
    embedded_id: { type: "string" },
    payload: { type: "string" },
    user_id: { type: "string" },
    label: { type: "string", nullable: true },
    created_at: { type: "string", format: "date-time", nullable: true },
  },
};

const errorObject = { type: "object", properties: { error: { type: "string" } } };

export default async function adminKtagsRoutes(fastify: FastifyInstance) {
  // Register a new ktag
  fastify.post<{ Body: { embedded_id: string; payload: string; user_id: string; label?: string } }>("/", {
    schema: {
      tags: ["Admin - KTags"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["embedded_id", "payload", "user_id"],
        properties: {
          embedded_id: { type: "string" },
          payload: { type: "string" },
          user_id: { type: "string" },
          label: { type: "string" },
        },
      },
      response: {
        200: ktagResponseSchema,
        401: errorObject,
        403: errorObject,
        409: errorObject,
      },
    },
    preHandler: [fastify.verifyAdmin],
    handler: async (request, reply) => {
      const { embedded_id, payload, user_id, label } = request.body;
      const [created] = await db
        .insert(ktagsTable)
        .values({ embedded_id, payload, user_id, label })
        .onConflictDoNothing()
        .returning();
      if (!created) {
        return reply.status(409).send({ error: "A ktag with this embedded_id already exists." });
      }
      return reply.send(created);
    },
  });

  // List all ktags (optionally filter by user_id)
  fastify.get<{ Querystring: { user_id?: string } }>("/", {
    schema: {
      tags: ["Admin - KTags"],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: { user_id: { type: "string" } },
      },
      response: {
        200: { type: "array", items: ktagResponseSchema },
        401: errorObject,
        403: errorObject,
      },
    },
    preHandler: [fastify.verifyAdmin],
    handler: async (request, reply) => {
      const { user_id } = request.query;
      const rows = user_id
        ? await db.select().from(ktagsTable).where(eq(ktagsTable.user_id, user_id))
        : await db.select().from(ktagsTable);
      return reply.send(rows);
    },
  });

  // Update any field of a ktag
  fastify.patch<{ Body: { payload?: string; user_id?: string; label?: string | null } }>("/:embedded_id", {
    schema: {
      tags: ["Admin - KTags"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          payload: { type: "string" },
          user_id: { type: "string" },
          label: { type: "string", nullable: true },
        },
      },
      response: {
        200: ktagResponseSchema,
        401: errorObject,
        403: errorObject,
        404: errorObject,
      },
    },
    preHandler: [fastify.verifyAdmin],
    handler: async (request, reply) => {
      const { embedded_id } = request.params as { embedded_id: string };
      const { payload, user_id, label } = request.body;
      const [updated] = await db
        .update(ktagsTable)
        .set({
          payload: payload ?? undefined,
          user_id: user_id ?? undefined,
          label: label !== undefined ? label : undefined,
        })
        .where(eq(ktagsTable.embedded_id, embedded_id))
        .returning();
      if (!updated) {
        return reply.status(404).send({ error: "KTag not found." });
      }
      return reply.send(updated);
    },
  });

  // Delete a ktag
  fastify.delete("/:embedded_id", {
    schema: {
      tags: ["Admin - KTags"],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: "object", properties: { success: { type: "boolean" } } },
        401: errorObject,
        403: errorObject,
      },
    },
    preHandler: [fastify.verifyAdmin],
    handler: async (request, reply) => {
      const { embedded_id } = request.params as { embedded_id: string };
      await db.delete(ktagsTable).where(eq(ktagsTable.embedded_id, embedded_id));
      return reply.send({ success: true });
    },
  });
}

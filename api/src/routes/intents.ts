import { FastifyInstance } from "fastify";
import { db, intentsTable, eq } from "@klariti/database";

type Goal = "FOCUS" | "WORK" | "STUDY" | "CASUAL";

const intentResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    user_id: { type: "string" },
    name: { type: "string" },
    goal: { type: "string", enum: ["FOCUS", "WORK", "STUDY", "CASUAL"] },
    is_active: { type: "boolean" },
    ends_at: { type: "string", format: "date-time", nullable: true },
    pause_threshold: { type: "number", nullable: true },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
};

export default async function intentsRoutes(fastify: FastifyInstance) {
  fastify.get("/", {
    schema: {
      tags: ["Intents"],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: "array", items: intentResponseSchema },
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const intents = await db
        .select()
        .from(intentsTable)
        .where(eq(intentsTable.user_id, userId));
      return reply.send(intents);
    },
  });

  fastify.post<{ Body: { name: string; goal: Goal; is_active?: boolean; ends_at?: string; pause_threshold?: number } }>("/", {
    schema: {
      tags: ["Intents"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["name", "goal"],
        properties: {
          name: { type: "string" },
          goal: { type: "string", enum: ["FOCUS", "WORK", "STUDY", "CASUAL"] },
          is_active: { type: "boolean" },
          ends_at: { type: "string", format: "date-time" },
          pause_threshold: { type: "number" },
        },
      },
      response: {
        200: intentResponseSchema,
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { name, goal, is_active, ends_at, pause_threshold } = request.body;
      const [created] = await db
        .insert(intentsTable)
        .values({
          user_id: userId,
          name,
          goal,
          is_active: is_active ?? false,
          ends_at: ends_at ? new Date(ends_at) : null,
          pause_threshold: pause_threshold ?? null,
        })
        .returning();
      return reply.send(created);
    },
  });

  fastify.get("/:id", {
    schema: {
      tags: ["Intents"],
      security: [{ bearerAuth: [] }],
      response: {
        200: intentResponseSchema,
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const [intent] = await db.select().from(intentsTable).where(eq(intentsTable.id, id));
      return reply.send(intent);
    },
  });

  fastify.put<{ Body: { name?: string; goal?: Goal; is_active?: boolean; ends_at?: string | null; pause_threshold?: number | null } }>("/:id", {
    schema: {
      tags: ["Intents"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          goal: { type: "string", enum: ["FOCUS", "WORK", "STUDY", "CASUAL"] },
          is_active: { type: "boolean" },
          ends_at: { type: "string", format: "date-time", nullable: true },
          pause_threshold: { type: "number", nullable: true },
        },
      },
      response: {
        200: intentResponseSchema,
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const { name, goal, is_active, ends_at, pause_threshold } = request.body;
      const [updated] = await db
        .update(intentsTable)
        .set({
          name: name ?? undefined,
          goal: goal ?? undefined,
          is_active: is_active ?? undefined,
          ends_at: ends_at !== undefined ? (ends_at ? new Date(ends_at) : null) : undefined,
          pause_threshold: pause_threshold !== undefined ? pause_threshold : undefined,
        })
        .where(eq(intentsTable.id, id))
        .returning();
      return reply.send(updated);
    },
  });

  fastify.delete("/:id", {
    schema: {
      tags: ["Intents"],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: "object", properties: { success: { type: "boolean" } } },
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await db.delete(intentsTable).where(eq(intentsTable.id, id));
      return reply.send({ success: true });
    },
  });
}

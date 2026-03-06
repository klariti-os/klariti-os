import fastify, { FastifyInstance } from "fastify";
import { db, groupPreferencesTable, eq } from "@klariti/database";

export default async function groupPreferencesRoutes(fastify: FastifyInstance) {
  fastify.get("/", {
    schema: {
      tags: ["Group Preferences"],
      security: [{ bearerAuth: [] }],
      response: { 200: { 
        type: "object", 
        properties: { 
            id: { type: "string", format: "uuid" }, 
            group_id: { type: "string" }, 
            global_kill_switch_enabled: { type: "boolean" }, 
            created_at: { type: "string", format: "date-time" }, 
            updated_at: { type: "string", format: "date-time" } 
        } 
            }, 
            401: { 
                type: "object", 
                properties: { error: { type: "string" } } 
            } 
        },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { group_id } = request.params as { group_id: string };
      const groupPreferences = await db
        .select()
        .from(groupPreferencesTable)
        .where(eq(groupPreferencesTable.group_id, group_id));
      return reply.send(groupPreferences);
    },
  });
  fastify.put("/", {
    schema: {
      tags: ["Group Preferences"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          global_kill_switch_enabled: { type: "boolean" },
        },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { group_id } = request.params as { group_id: string };
      const { global_kill_switch_enabled } = request.body as { global_kill_switch_enabled: boolean };
      const [updated] = await db
        .update(groupPreferencesTable)
        .set({ global_kill_switch_enabled })
        .where(eq(groupPreferencesTable.group_id, group_id))
        .returning();   
        return reply.send(updated);
      },
    });
}

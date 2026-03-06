import { FastifyInstance } from "fastify";
import { db, userPreferencesTable, eq } from "@klariti/database";   

export default async function userPreferencesRoutes(fastify: FastifyInstance) {
  fastify.get("/", {
    schema: {
      tags: ["User Preferences"],
      security: [{ bearerAuth: [] }],
      response: { 200: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string" },
          global_kill_switch_enabled: { type: "boolean" },
        },
      },
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const userPreferences = await db
        .select()
        .from(userPreferencesTable)
        .where(eq(userPreferencesTable.user_id, userId));
      return reply.send(userPreferences);
    },
  });

  fastify.put("/", {
    schema: {
      tags: ["User Preferences"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          global_kill_switch_enabled: { type: "boolean" },
        },
      },
      response: { 200: { 
        type: "object", 
        properties: { 
            id: { 
                type: "string", 
                format: "uuid" 
            }, 
            user_id: { type: "string" }, 
            global_kill_switch_enabled: { type: "boolean" }, 
            created_at: { type: "string", format: "date-time" }, 
            updated_at: { type: "string", format: "date-time" } } }, 
            401: { 
                type: "object", 
                properties: { error: { type: "string" } } 
            } 
        },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { global_kill_switch_enabled } = request.body as { global_kill_switch_enabled: boolean };
      const [updated] = await db
        .update(userPreferencesTable)
        .set({ global_kill_switch_enabled })
        .where(eq(userPreferencesTable.user_id, userId))
        .returning();
        
      return reply.send(updated);
    },
  });
}

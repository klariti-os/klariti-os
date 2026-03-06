import { FastifyInstance } from "fastify";
import {db, profilesTable, eq} from "@klariti/database";

export default async function profilesRoutes(fastify: FastifyInstance) {
  fastify.get("/", {
    schema: {
      tags: ["Profiles"],
      security: [{ bearerAuth: [] }],
      response: { 
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
              name: { type: "string" },
              isActive: { type: "boolean" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
        401: { 
            type: "object", 
            properties: { 
                error: { type: "string" } 
            } 
        },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
        const userId = request.session!.user.id;
        const profiles = await db
            .select()
            .from(profilesTable)
            .where(eq(profilesTable.user_id, userId));  
      return reply.send(profiles);
    },
  });

  fastify.post<{ Body: { name: string; is_active?: boolean } }>("/", {
    schema: {
      tags: ["Profiles"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          is_active: { type: "boolean" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string" },
            name: { type: "string" },
            is_active: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const { name, is_active } = request.body;
      const [created] = await db
        .insert(profilesTable)
        .values({
          user_id: userId,
          name,
          is_active: is_active ?? false,
        })
        .returning();
      return reply.send(created);
    },
  });

  // Get profile by id
  fastify.get("/:id", {
    schema: {
      tags: ["Profiles"],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string" },
            name: { type: "string" },
            is_active: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, id));
      return reply.send(profile);
    },
  });

  // Update profile by id
  fastify.put<{ Body: { name?: string; is_active?: boolean } }>("/:id", {
    schema: {
      tags: ["Profiles"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          is_active: { type: "boolean" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string" },
            name: { type: "string" },
            is_active: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const { name, is_active } = request.body;
      const [updated] = await db
        .update(profilesTable)
        .set({
          name: name ?? undefined,
          is_active: is_active ?? undefined,
        })
        .where(eq(profilesTable.id, id))
        .returning();
      return reply.send(updated);
    },
  });

  // Delete profile by id
  fastify.delete("/:id", {
    schema: {
      tags: ["Profiles"],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: "object", properties: { success: { type: "boolean" } } },
        401: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await db.delete(profilesTable).where(eq(profilesTable.id, id));
      return reply.send({ success: true });
    },
  });
}
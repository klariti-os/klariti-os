import { FastifyInstance } from "fastify";
import { db, groupTable, eq } from "@klariti/database";

export default async function groupsRoutes(fastify: FastifyInstance) {
  fastify.get("/", {
    schema: {
      tags: ["Groups"],
      security: [{ bearerAuth: [] }],
      response: { 
        200: { 
            type: "object", 
            properties: { 
                id: { 
                    type: "string", 
                    format: "uuid" }, 
                    name: { type: "string" }, 
                    description: { type: "string" }, 
                    created_at: { type: "string", 
                        format: "date-time" }, 
                        updated_at: { 
                            type: "string", 
                            format: "date-time" } 
                        } 
                    }, 
                    401: {
                         type: "object", 
                         properties: { 
                            error: { type: "string" 

                            } 
                        } 
                    } 
                },
            },
    preHandler: [fastify.verifySession],
    handler: async (request, reply) => {
      const userId = request.session!.user.id;
      const groups = await db
        .select()
        .from(groupTable)
        .where(eq(groupTable.owner_id, userId));
      return reply.send(groups);
    },
  });
}
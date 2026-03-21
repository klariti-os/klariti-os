import { FastifyInstance } from "fastify";
import { db, ktagsTable, authUser, eq } from "@klariti/database";
import { errorObject } from "../schemas/shared.schema";
import { parseKtagMessage } from "../lib/ktag-issuance";

const publicTagObject = {
  type: "object",
  properties: {
    tag_id: { type: "string" },
    tag_name: { type: "string" },
    owner_name: { type: "string", nullable: true },
    status: { type: "string", enum: ["active", "revoked"] },
  },
} as const;

export default async function publicTagRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { message: string } }>("/:message", {
    schema: {
      tags: ["Public - Tags"],
      params: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string", minLength: 1 },
        },
      },
      response: {
        200: publicTagObject,
        404: errorObject,
      },
    },
    handler: async (request, reply) => {
      const message = request.params.message.trim();
      const parsedMessage = parseKtagMessage(message);

      if (!parsedMessage) {
        return reply.status(404).send({ error: "Tag not found." });
      }

      const [ktag] = await db
        .select({
          tag_id: ktagsTable.tag_id,
          label: ktagsTable.label,
          owner_id: ktagsTable.owner_id,
          status: ktagsTable.status,
          signature: ktagsTable.signature,
          sig_version: ktagsTable.sig_version,
        })
        .from(ktagsTable)
        .where(eq(ktagsTable.tag_id, parsedMessage.tagId))
        .limit(1);

      if (!ktag ||
          ktag.signature !== parsedMessage.signature ||
          ktag.sig_version !== parsedMessage.sigVersion) {
        return reply.status(404).send({ error: "Tag not found." });
      }

      const [owner] = ktag.owner_id
        ? await db
            .select({ name: authUser.name })
            .from(authUser)
            .where(eq(authUser.id, ktag.owner_id))
            .limit(1)
        : [];

      return reply.send({
        tag_id: ktag.tag_id,
        tag_name: ktag.label ?? ktag.tag_id,
        owner_name: owner?.name ?? null,
        status: ktag.status,
      });
    },
  });
}

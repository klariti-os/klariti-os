import { FastifyInstance } from "fastify";
import { db, ktagsTable, eq } from "@klariti/database";
import { errorObject, successObject } from "../schemas/shared.schema";
import { ktagObject } from "../schemas/ktags.schema";
import { generateKtagLabel, issueKtag, hashKtagUid } from "../lib/ktag-issuance";

function isUniqueViolation(error: unknown, constraintName: string): boolean {
  if (!error || typeof error !== "object") return false;

  const dbError = error as { code?: string; constraint?: string };
  return dbError.code === "23505" && dbError.constraint === constraintName;
}

function resolveRevokedAt(status?: "active" | "revoked", revokedAt?: string | null) {
  if (revokedAt !== undefined) return revokedAt ? new Date(revokedAt) : null;
  if (status === "revoked") return new Date();
  if (status === "active") return null;
  return undefined;
}

export default async function adminKtagsRoutes(fastify: FastifyInstance) {
  // Register a new ktag
  fastify.post<{
    Body: {
      uid: string;
      tag_type?: string | null;
    };
  }>("/register", {
    schema: {
      tags: ["Admin - KTags"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        additionalProperties: false,
        required: ["uid"],
        properties: {
          uid: { type: "string", minLength: 1 },
          tag_type: { type: "string", nullable: true },
        },
      },
      response: { 201: ktagObject, 400: errorObject, 401: errorObject, 403: errorObject, 409: errorObject, 500: errorObject },
    },
    preHandler: [fastify.verifyAdmin],
    handler: async (request, reply) => {
      const { uid, tag_type } = request.body;

      let uidHash: string;
      try {
        uidHash = hashKtagUid(uid);
      } catch (error) {
        return reply.status(400).send({
          error: error instanceof Error ? error.message : "Invalid NFC UID.",
        });
      }

      const existingByUid = await db
        .select({ tag_id: ktagsTable.tag_id })
        .from(ktagsTable)
        .where(eq(ktagsTable.uid_hash, uidHash))
        .limit(1);

      if (existingByUid[0]) {
        return reply.status(409).send({ error: "A ktag with this UID already exists." });
      }

      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const issued = issueKtag(uid);
          const [created] = await db
            .insert(ktagsTable)
            .values({
              ...issued,
              status: "active",
              owner_id: null,
              label: generateKtagLabel(),
              tag_type: tag_type ?? null,
            })
            .onConflictDoNothing({ target: ktagsTable.tag_id })
            .returning();

          if (created) return reply.status(201).send(created);
        } catch (error) {
          if (isUniqueViolation(error, "ktags_uid_hash_unique")) {
            return reply.status(409).send({ error: "A ktag with this UID already exists." });
          }

          request.log.error({ err: error }, "Failed to issue ktag");
          return reply.status(500).send({
            error: error instanceof Error ? error.message : "Failed to issue ktag.",
          });
        }
      }

      return reply.status(409).send({ error: "Could not generate a unique ktag id." });
    },
  });

  // List all ktags (optionally filter by owner_id)
  fastify.get<{ Querystring: { owner_id?: string } }>("/", {
    schema: {
      tags: ["Admin - KTags"],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: { owner_id: { type: "string" } },
      },
      response: { 200: { type: "array", items: ktagObject }, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifyAdmin],
    handler: async (request, reply) => {
      const { owner_id } = request.query;
      const rows = owner_id
        ? await db.select().from(ktagsTable).where(eq(ktagsTable.owner_id, owner_id))
        : await db.select().from(ktagsTable);
      return reply.send(rows);
    },
  });

  // Update mutable inventory / assignment fields of a ktag
  fastify.patch<{
    Body: {
      status?: "active" | "revoked";
      owner_id?: string | null;
      label?: string | null;
      tag_type?: string | null;
      revoked_at?: string | null;
    };
  }>("/:tag_id", {
    schema: {
      tags: ["Admin - KTags"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        additionalProperties: false,
        properties: {
          status: { type: "string", enum: ["active", "revoked"] },
          owner_id: { type: "string", nullable: true },
          label: { type: "string", nullable: true },
          tag_type: { type: "string", nullable: true },
          revoked_at: { type: "string", format: "date-time", nullable: true },
        },
      },
      response: { 200: ktagObject, 401: errorObject, 403: errorObject, 404: errorObject },
    },
    preHandler: [fastify.verifyAdmin],
    handler: async (request, reply) => {
      const { tag_id } = request.params as { tag_id: string };
      const { status, owner_id, label, tag_type, revoked_at } = request.body;
      const [updated] = await db
        .update(ktagsTable)
        .set({
          status: status ?? undefined,
          owner_id: owner_id !== undefined ? owner_id : undefined,
          label: label !== undefined ? label : undefined,
          tag_type: tag_type !== undefined ? tag_type : undefined,
          revoked_at: resolveRevokedAt(status, revoked_at),
        })
        .where(eq(ktagsTable.tag_id, tag_id))
        .returning();
      if (!updated) return reply.status(404).send({ error: "KTag not found." });
      return reply.send(updated);
    },
  });

  // Delete a ktag
  fastify.delete("/:tag_id", {
    schema: {
      tags: ["Admin - KTags"],
      security: [{ bearerAuth: [] }],
      response: { 200: successObject, 401: errorObject, 403: errorObject },
    },
    preHandler: [fastify.verifyAdmin],
    handler: async (request, reply) => {
      const { tag_id } = request.params as { tag_id: string };
      await db.delete(ktagsTable).where(eq(ktagsTable.tag_id, tag_id));
      return reply.send({ success: true });
    },
  });
}

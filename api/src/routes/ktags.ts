import { FastifyInstance } from "fastify";
import { RegisterKtagBodySchema, UpdateKtagAdminBodySchema, type RegisterKtagBody, type UpdateKtagAdminBody } from "@klariti/contracts";
import { ktagsRepository } from "../repositories/ktags.repository.js";
import { generateKtagLabel, issueKtag, hashKtagUid, parseKtagMessage } from "../lib/ktag-issuance.js";

function isUniqueViolation(error: unknown, constraintName: string): boolean {
  if (!error || typeof error !== "object") return false;
  const dbError = error as { code?: string; constraint?: string };
  return dbError.code === "23505" && dbError.constraint === constraintName;
}

function resolveRevokedAt(status: "active" | "revoked" | undefined, currentRevokedAt: Date | null) {
  if (status === "revoked" && currentRevokedAt === null) return new Date();
  if (status === "active") return null;
  return currentRevokedAt;
}

export default async function ktagsRoutes(fastify: FastifyInstance) {
  // ── User ktag routes ──────────────────────────────────────────────────────
  fastify.register(async (scope) => {
    scope.addHook("preHandler", fastify.verifySession);

    scope.get("/api/me/ktags", {
      schema: { tags: ["KTags"], security: [{ bearerAuth: [] }] },
      handler: async (request, reply) => {
        const rows = await ktagsRepository.listByOwner(request.session!.user.id);
        return reply.send(rows);
      },
    });

    scope.patch<{ Params: { tag_id: string }; Body: { label: string | null } }>("/api/me/ktags/:tag_id/label", {
      schema: { tags: ["KTags"], security: [{ bearerAuth: [] }], body: { type: "object" } },
      handler: async (request, reply) => {
        const [updated] = await ktagsRepository.updateLabel(request.params.tag_id, request.session!.user.id, request.body.label);
        if (!updated) return reply.status(404).send({ error: "KTag not found." });
        return reply.send(updated);
      },
    });
  });

  // ── Admin ktag routes ─────────────────────────────────────────────────────
  fastify.register(async (scope) => {
    scope.addHook("preHandler", fastify.verifyAdmin);

    scope.post<{ Body: RegisterKtagBody }>("/api/admin/ktags", {
      schema: { tags: ["Admin KTags"], security: [{ bearerAuth: [] }], body: { type: "object" } },
      handler: async (request, reply) => {
        const parsed = RegisterKtagBodySchema.strict().safeParse(request.body);
        if (!parsed.success) return reply.status(400).send({ error: "Invalid body" });
        const { uid, tag_type } = parsed.data;

        let uidHash: string;
        try {
          uidHash = hashKtagUid(uid);
        } catch (error) {
          return reply.status(400).send({ error: error instanceof Error ? error.message : "Invalid NFC UID." });
        }

        const existing = await ktagsRepository.findByUidHash(uidHash);
        if (existing[0]) return reply.status(409).send({ error: "A ktag with this UID already exists." });

        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            const issued = issueKtag(uid);
            const [created] = await ktagsRepository.insert({
              ...issued,
              status: "active",
              owner_id: null,
              label: generateKtagLabel(),
              tag_type,
            });
            if (created) return reply.status(201).send(created);
          } catch (error) {
            if (isUniqueViolation(error, "ktags_uid_hash_unique")) {
              return reply.status(409).send({ error: "A ktag with this UID already exists." });
            }
            request.log.error({ err: error }, "Failed to issue ktag");
            return reply.status(500).send({ error: error instanceof Error ? error.message : "Failed to issue ktag." });
          }
        }
        return reply.status(409).send({ error: "Could not generate a unique ktag id." });
      },
    });

    scope.get<{ Querystring: { owner_id?: string } }>("/api/admin/ktags", {
      schema: { tags: ["Admin KTags"], security: [{ bearerAuth: [] }] },
      handler: async (request, reply) => {
        const rows = await ktagsRepository.listAll(request.query.owner_id);
        return reply.send(rows);
      },
    });

    scope.get<{ Params: { uid: string } }>("/api/admin/ktags/uid/:uid", {
      schema: { tags: ["Admin KTags"], security: [{ bearerAuth: [] }] },
      handler: async (request, reply) => {
        let uidHash: string;
        try {
          uidHash = hashKtagUid(request.params.uid);
        } catch (error) {
          return reply.status(400).send({ error: error instanceof Error ? error.message : "Invalid NFC UID." });
        }
        const [ktag] = await ktagsRepository.findByUidHash(uidHash);
        if (!ktag) return reply.status(404).send({ error: "KTag not found." });
        const [full] = await ktagsRepository.findByTagId((ktag as any).tag_id);
        return reply.send(full);
      },
    });

    scope.get<{ Params: { tag_id: string } }>("/api/admin/ktags/:tag_id", {
      schema: { tags: ["Admin KTags"], security: [{ bearerAuth: [] }] },
      handler: async (request, reply) => {
        const [ktag] = await ktagsRepository.findByTagId(request.params.tag_id);
        if (!ktag) return reply.status(404).send({ error: "KTag not found." });
        return reply.send(ktag);
      },
    });

    scope.patch<{ Params: { tag_id: string }; Body: UpdateKtagAdminBody }>("/api/admin/ktags/:tag_id", {
      schema: { tags: ["Admin KTags"], security: [{ bearerAuth: [] }], body: { type: "object" } },
      handler: async (request, reply) => {
        const parsed = UpdateKtagAdminBodySchema.strict().safeParse(request.body);
        if (!parsed.success) return reply.status(400).send({ error: "Invalid body" });

        const [existing] = await ktagsRepository.findByTagId(request.params.tag_id);
        if (!existing) return reply.status(404).send({ error: "KTag not found." });

        const nextRevokedAt = resolveRevokedAt(parsed.data.status, existing.revoked_at ?? null);
        const [updated] = await ktagsRepository.update(request.params.tag_id, {
          status: parsed.data.status ?? undefined,
          owner_id: parsed.data.owner_id !== undefined ? parsed.data.owner_id : undefined,
          label: parsed.data.label !== undefined ? parsed.data.label : undefined,
          tag_type: parsed.data.tag_type !== undefined ? parsed.data.tag_type : undefined,
          revoked_at: nextRevokedAt,
        });
        return reply.send(updated);
      },
    });

    scope.delete<{ Params: { tag_id: string } }>("/api/admin/ktags/:tag_id", {
      schema: { tags: ["Admin KTags"], security: [{ bearerAuth: [] }] },
      handler: async (request, reply) => {
        await ktagsRepository.delete(request.params.tag_id);
        return reply.send({ success: true });
      },
    });
  });

  // ── Public tag route ──────────────────────────────────────────────────────
  fastify.get<{ Params: { message: string } }>("/api/tag/:message", {
    schema: { tags: ["Public"] },
    handler: async (request, reply) => {
      const message = request.params.message.trim();
      const parsed = parseKtagMessage(message);
      if (!parsed) return reply.status(404).send({ error: "Tag not found." });

      const [ktag] = await ktagsRepository.findPublicTag(parsed.tagId);
      if (
        !ktag ||
        ktag.signature !== parsed.signature ||
        ktag.sig_version !== parsed.sigVersion
      ) {
        return reply.status(404).send({ error: "Tag not found." });
      }

      const ownerRows = ktag.owner_id
        ? await ktagsRepository.findOwnerName(ktag.owner_id)
        : [];

      return reply.send({
        tag_id: ktag.tag_id,
        tag_name: ktag.label ?? ktag.tag_id,
        owner_name: ownerRows[0]?.name ?? null,
        status: ktag.status,
      });
    },
  });
}

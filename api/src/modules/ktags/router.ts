import { initServer } from "@ts-rest/fastify";

const s = initServer();
import { requireAdmin, requireSession } from "../common/guards.js";
import { ktagsRepository } from "./repository.js";
import {
  adminKtagsContract,
  ktagsContract,
  publicContract,
} from "./contract.js";
import {
  generateKtagLabel,
  issueKtag,
  hashKtagUid,
  parseKtagMessage,
} from "./service.js";
import { serializeKtag, serializeKtags } from "./serializers.js";

function isUniqueViolation(error: unknown, constraintName: string): boolean {
  if (!error || typeof error !== "object") return false;
  const dbError = error as { code?: string; constraint?: string };
  return dbError.code === "23505" && dbError.constraint === constraintName;
}

function resolveRevokedAt(
  status: "active" | "revoked" | undefined,
  currentRevokedAt: Date | null,
) {
  if (status === "revoked" && currentRevokedAt === null) return new Date();
  if (status === "active") return null;
  return currentRevokedAt;
}

const sessionRoute = { hooks: { preHandler: requireSession } };
const adminRoute = { hooks: { preHandler: requireAdmin } };

export const ktagsRouter = s.router(ktagsContract, {
  listMine: {
    ...sessionRoute,
    handler: async ({ request }) => {
      const rows = await ktagsRepository.listByOwner(request.session!.user.id);

      return {
        status: 200,
        body: serializeKtags(rows),
      };
    },
  },

  updateLabel: {
    ...sessionRoute,
    handler: async ({ params, body, request }) => {
      const [updated] = await ktagsRepository.updateLabel(
        params.tag_id,
        request.session!.user.id,
        body.label,
      );

      if (!updated) {
        return { status: 404, body: { error: "KTag not found." } };
      }

      return {
        status: 200,
        body: serializeKtag(updated),
      };
    },
  },
});

export const adminKtagsRouter = s.router(adminKtagsContract, {
  register: {
    ...adminRoute,
    handler: async ({ body, request }) => {
      const { uid, tag_type } = body;

      let uidHash: string;
      try {
        uidHash = hashKtagUid(uid);
      } catch (error) {
        return {
          status: 400,
          body: { error: error instanceof Error ? error.message : "Invalid NFC UID." },
        };
      }

      const existing = await ktagsRepository.findByUidHash(uidHash);
      if (existing[0]) {
        return {
          status: 409,
          body: { error: "A ktag with this UID already exists." },
        };
      }

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

          if (created) {
            return {
              status: 201,
              body: serializeKtag(created),
            };
          }
        } catch (error) {
          if (isUniqueViolation(error, "ktags_uid_hash_unique")) {
            return {
              status: 409,
              body: { error: "A ktag with this UID already exists." },
            };
          }

          request.log.error({ err: error }, "Failed to issue ktag");
          return {
            status: 500,
            body: { error: error instanceof Error ? error.message : "Failed to issue ktag." },
          };
        }
      }

      return {
        status: 409,
        body: { error: "Could not generate a unique ktag id." },
      };
    },
  },

  list: {
    ...adminRoute,
    handler: async ({ query }) => {
      const rows = await ktagsRepository.listAll(query.owner_id);

      return {
        status: 200,
        body: serializeKtags(rows),
      };
    },
  },

  getByUid: {
    ...adminRoute,
    handler: async ({ params }) => {
      let uidHash: string;
      try {
        uidHash = hashKtagUid(params.uid);
      } catch (error) {
        return {
          status: 400,
          body: { error: error instanceof Error ? error.message : "Invalid NFC UID." },
        };
      }

      const [ktag] = await ktagsRepository.findByUidHash(uidHash);
      if (!ktag) {
        return { status: 404, body: { error: "KTag not found." } };
      }

      const [full] = await ktagsRepository.findByTagId(ktag.tag_id);
      if (!full) {
        return { status: 404, body: { error: "KTag not found." } };
      }

      return {
        status: 200,
        body: serializeKtag(full),
      };
    },
  },

  getByTagId: {
    ...adminRoute,
    handler: async ({ params }) => {
      const [ktag] = await ktagsRepository.findByTagId(params.tag_id);

      if (!ktag) {
        return { status: 404, body: { error: "KTag not found." } };
      }

      return {
        status: 200,
        body: serializeKtag(ktag),
      };
    },
  },

  update: {
    ...adminRoute,
    handler: async ({ params, body }) => {
      const [existing] = await ktagsRepository.findByTagId(params.tag_id);

      if (!existing) {
        return { status: 404, body: { error: "KTag not found." } };
      }

      const nextRevokedAt = resolveRevokedAt(body.status, existing.revoked_at ?? null);
      const [updated] = await ktagsRepository.update(params.tag_id, {
        status: body.status ?? undefined,
        owner_id: body.owner_id !== undefined ? body.owner_id : undefined,
        label: body.label !== undefined ? body.label : undefined,
        tag_type: body.tag_type !== undefined ? body.tag_type : undefined,
        revoked_at: nextRevokedAt,
      });

      return {
        status: 200,
        body: serializeKtag(updated),
      };
    },
  },

  delete: {
    ...adminRoute,
    handler: async ({ params }) => {
      await ktagsRepository.delete(params.tag_id);

      return {
        status: 200,
        body: { success: true },
      };
    },
  },
});

export const publicRouter = s.router(publicContract, {
  getTag: async ({ params }) => {
    const message = params.message.trim();
    const parsed = parseKtagMessage(message);

    if (!parsed) {
      return { status: 404, body: { error: "Tag not found." } };
    }

    const [ktag] = await ktagsRepository.findPublicTag(parsed.tagId);
    if (
      !ktag ||
      ktag.signature !== parsed.signature ||
      ktag.sig_version !== parsed.sigVersion
    ) {
      return { status: 404, body: { error: "Tag not found." } };
    }

    const ownerRows = ktag.owner_id
      ? await ktagsRepository.findOwnerName(ktag.owner_id)
      : [];

    return {
      status: 200,
      body: {
        tag_id: ktag.tag_id,
        tag_name: ktag.label ?? ktag.tag_id,
        owner_name: ownerRows[0]?.name ?? null,
        status: ktag.status,
      },
    };
  },
});

import { db, authUser, ktagsTable, eq, and } from "@klariti/database";
import type { KtagType } from "@klariti/contracts";

export const ktagsRepository = {
  listByOwner: (ownerId: string) =>
    db.select().from(ktagsTable).where(eq(ktagsTable.owner_id, ownerId)),

  findByTagId: (tagId: string) =>
    db.select().from(ktagsTable).where(eq(ktagsTable.tag_id, tagId)).limit(1),

  findByUidHash: (uidHash: string) =>
    db
      .select({ tag_id: ktagsTable.tag_id })
      .from(ktagsTable)
      .where(eq(ktagsTable.uid_hash, uidHash))
      .limit(1),

  listAll: (ownerId?: string) =>
    ownerId
      ? db.select().from(ktagsTable).where(eq(ktagsTable.owner_id, ownerId))
      : db.select().from(ktagsTable),

  updateLabel: (tagId: string, ownerId: string, label: string | null) =>
    db
      .update(ktagsTable)
      .set({ label })
      .where(and(eq(ktagsTable.tag_id, tagId), eq(ktagsTable.owner_id, ownerId)))
      .returning(),

  insert: (values: {
    tag_id: string;
    uid_hash: string;
    payload: string;
    signature: string | null;
    sig_version: number | null;
    status: "active";
    owner_id: null;
    label: string;
    tag_type: KtagType;
  }) =>
    db
      .insert(ktagsTable)
      .values(values)
      .onConflictDoNothing({ target: ktagsTable.tag_id })
      .returning(),

  update: (tagId: string, values: {
    status?: "active" | "revoked";
    owner_id?: string | null;
    label?: string | null;
    tag_type?: KtagType;
    revoked_at?: Date | null;
  }) =>
    db
      .update(ktagsTable)
      .set(values)
      .where(eq(ktagsTable.tag_id, tagId))
      .returning(),

  delete: (tagId: string) =>
    db.delete(ktagsTable).where(eq(ktagsTable.tag_id, tagId)),

  findPublicTag: (tagId: string) =>
    db
      .select({
        tag_id: ktagsTable.tag_id,
        label: ktagsTable.label,
        owner_id: ktagsTable.owner_id,
        status: ktagsTable.status,
        signature: ktagsTable.signature,
        sig_version: ktagsTable.sig_version,
      })
      .from(ktagsTable)
      .where(eq(ktagsTable.tag_id, tagId))
      .limit(1),

  findOwnerName: (ownerId: string) =>
    db
      .select({ name: authUser.name })
      .from(authUser)
      .where(eq(authUser.id, ownerId))
      .limit(1),
};

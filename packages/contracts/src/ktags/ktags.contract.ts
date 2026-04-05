import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ErrorSchema, SuccessSchema } from "../common/errors.schemas.js";
import {
  KtagSchema,
  PublicTagSchema,
  UpdateKtagLabelBodySchema,
  RegisterKtagBodySchema,
  UpdateKtagAdminBodySchema,
} from "./ktags.schemas.js";

const c = initContract();

export const ktagsContract = c.router({
  listMine: {
    method: "GET",
    path: "/api/me/ktags",
    responses: { 200: z.array(KtagSchema), 401: ErrorSchema },
    summary: "List own ktags",
    metadata: { tags: ["Me"], security: [{ bearerAuth: [] }] } as const,
  },
  updateLabel: {
    method: "PATCH",
    path: "/api/me/ktags/:tag_id",
    pathParams: z.object({ tag_id: z.string() }),
    body: UpdateKtagLabelBodySchema,
    responses: { 200: KtagSchema, 401: ErrorSchema, 404: ErrorSchema },
    summary: "Update ktag label",
    metadata: { tags: ["Me"], security: [{ bearerAuth: [] }] } as const,
  },
});

export const adminKtagsContract = c.router({
  register: {
    method: "POST",
    path: "/api/admin/ktag/register",
    body: RegisterKtagBodySchema,
    responses: {
      201: KtagSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      403: ErrorSchema,
      409: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Register a new ktag",
    metadata: { tags: ["Admin - KTags"], security: [{ bearerAuth: [] }] } as const,
  },
  list: {
    method: "GET",
    path: "/api/admin/ktag",
    query: z.object({ owner_id: z.string().optional() }),
    responses: { 200: z.array(KtagSchema), 401: ErrorSchema, 403: ErrorSchema },
    summary: "List all ktags",
    metadata: { tags: ["Admin - KTags"], security: [{ bearerAuth: [] }] } as const,
  },
  getByUid: {
    method: "GET",
    path: "/api/admin/ktag/uid/:uid",
    pathParams: z.object({ uid: z.string() }),
    responses: {
      200: KtagSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      403: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Look up a ktag by NFC UID",
    metadata: { tags: ["Admin - KTags"], security: [{ bearerAuth: [] }] } as const,
  },
  getByTagId: {
    method: "GET",
    path: "/api/admin/ktag/:tag_id",
    pathParams: z.object({ tag_id: z.string() }),
    responses: {
      200: KtagSchema,
      401: ErrorSchema,
      403: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Look up a ktag by tag ID",
    metadata: { tags: ["Admin - KTags"], security: [{ bearerAuth: [] }] } as const,
  },
  update: {
    method: "PATCH",
    path: "/api/admin/ktag/:tag_id",
    pathParams: z.object({ tag_id: z.string() }),
    body: UpdateKtagAdminBodySchema,
    responses: {
      200: KtagSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      403: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update a ktag",
    metadata: { tags: ["Admin - KTags"], security: [{ bearerAuth: [] }] } as const,
  },
  delete: {
    method: "DELETE",
    path: "/api/admin/ktag/:tag_id",
    pathParams: z.object({ tag_id: z.string() }),
    body: c.noBody(),
    responses: { 200: SuccessSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Delete a ktag",
    metadata: { tags: ["Admin - KTags"], security: [{ bearerAuth: [] }] } as const,
  },
});

export const publicContract = c.router({
  getTag: {
    method: "GET",
    path: "/api/tag/:message",
    pathParams: z.object({ message: z.string().min(1) }),
    responses: { 200: PublicTagSchema, 404: ErrorSchema },
    summary: "Look up a tag by its NFC message",
    metadata: { tags: ["Public - Tags"] } as const,
  },
});

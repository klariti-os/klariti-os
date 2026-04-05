import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ErrorSchema, SuccessSchema } from "../common/errors.schemas.js";
import {
  ChallengeSchema,
  ChallengeWithStatusSchema,
  ParticipantSchema,
  ChallengeRequestSchema,
  CreateChallengeBodySchema,
  UpdateChallengeBodySchema,
  InviteToChallengeBodySchema,
  ChallengeRequestActionBodySchema,
  ChallengeStatusBodySchema,
} from "./challenges.schemas.js";

const c = initContract();

const sec = { metadata: { tags: ["Challenges"], security: [{ bearerAuth: [] }] } as const };

export const challengesContract = c.router({
  list: {
    method: "GET",
    path: "/api/me/challenges",
    responses: { 200: z.array(ChallengeWithStatusSchema), 401: ErrorSchema },
    summary: "List challenges the user participates in",
    ...sec,
  },
  create: {
    method: "POST",
    path: "/api/me/challenges",
    body: CreateChallengeBodySchema,
    responses: { 200: ChallengeSchema, 401: ErrorSchema },
    summary: "Create a challenge",
    ...sec,
  },
  getById: {
    method: "GET",
    path: "/api/me/challenges/:id",
    pathParams: z.object({ id: z.string() }),
    responses: { 200: ChallengeSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Get a single challenge",
    ...sec,
  },
  update: {
    method: "PUT",
    path: "/api/me/challenges/:id",
    pathParams: z.object({ id: z.string() }),
    body: UpdateChallengeBodySchema,
    responses: { 200: ChallengeSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Update a challenge (creator only)",
    ...sec,
  },
  delete: {
    method: "DELETE",
    path: "/api/me/challenges/:id",
    pathParams: z.object({ id: z.string() }),
    body: c.noBody(),
    responses: { 200: SuccessSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Delete a challenge (creator only)",
    ...sec,
  },
  leave: {
    method: "DELETE",
    path: "/api/me/challenges/:id/leave",
    pathParams: z.object({ id: z.string() }),
    body: c.noBody(),
    responses: { 200: SuccessSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Leave a challenge",
    ...sec,
  },
  invite: {
    method: "POST",
    path: "/api/me/challenges/:id/invite",
    pathParams: z.object({ id: z.string() }),
    body: InviteToChallengeBodySchema,
    responses: {
      200: ChallengeRequestSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      403: ErrorSchema,
    },
    summary: "Invite a friend to a challenge (creator only)",
    ...sec,
  },
  updateStatus: {
    method: "PATCH",
    path: "/api/me/challenges/:id/status",
    pathParams: z.object({ id: z.string() }),
    body: ChallengeStatusBodySchema,
    responses: { 200: ParticipantSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Pause or resume participation",
    ...sec,
  },
  listReceivedRequests: {
    method: "GET",
    path: "/api/me/challenges/requests/received",
    responses: { 200: z.array(ChallengeRequestSchema), 401: ErrorSchema },
    summary: "List pending challenge invites received",
    ...sec,
  },
  listSentRequests: {
    method: "GET",
    path: "/api/me/challenges/requests/sent",
    responses: { 200: z.array(ChallengeRequestSchema), 401: ErrorSchema },
    summary: "List challenge invites sent",
    ...sec,
  },
  withdrawRequest: {
    method: "DELETE",
    path: "/api/me/challenges/requests/:requestId",
    pathParams: z.object({ requestId: z.string() }),
    body: c.noBody(),
    responses: { 200: ChallengeRequestSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Withdraw a sent challenge invite",
    ...sec,
  },
  respondToRequest: {
    method: "PATCH",
    path: "/api/me/challenges/requests/:requestId",
    pathParams: z.object({ requestId: z.string() }),
    body: ChallengeRequestActionBodySchema,
    responses: { 200: ChallengeRequestSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Respond to a challenge invite",
    ...sec,
  },
});

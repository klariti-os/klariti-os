import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ErrorSchema, SuccessSchema } from "../common/errors.schemas.js";
import {
  FriendSchema,
  FriendRequestSchema,
  FriendRequestUserSchema,
  SentRequestUserSchema,
  SendFriendRequestBodySchema,
  FriendRequestActionBodySchema,
} from "./schemas.js";

const c = initContract();

const sec = { metadata: { tags: ["Friends"], security: [{ bearerAuth: [] }] } as const };

export const friendsContract = c.router({
  list: {
    method: "GET",
    path: "/api/me/friends",
    responses: { 200: z.array(FriendSchema), 401: ErrorSchema },
    summary: "List active friends",
    ...sec,
  },
  listSentRequests: {
    method: "GET",
    path: "/api/me/friends/requests/sent",
    responses: { 200: z.array(SentRequestUserSchema), 401: ErrorSchema },
    summary: "List sent friend requests",
    ...sec,
  },
  listReceivedRequests: {
    method: "GET",
    path: "/api/me/friends/requests/received",
    responses: { 200: z.array(FriendRequestUserSchema), 401: ErrorSchema },
    summary: "List received friend requests",
    ...sec,
  },
  sendRequest: {
    method: "POST",
    path: "/api/me/friends/requests",
    body: SendFriendRequestBodySchema,
    responses: { 200: FriendRequestSchema, 400: ErrorSchema, 401: ErrorSchema },
    summary: "Send a friend request",
    ...sec,
  },
  respondToRequest: {
    method: "PATCH",
    path: "/api/me/friends/requests/:requestId",
    pathParams: z.object({ requestId: z.string() }),
    body: FriendRequestActionBodySchema,
    responses: { 200: FriendRequestSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Accept or decline a friend request",
    ...sec,
  },
  withdrawRequest: {
    method: "DELETE",
    path: "/api/me/friends/requests/:requestId",
    pathParams: z.object({ requestId: z.string() }),
    body: c.noBody(),
    responses: { 200: FriendRequestSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Withdraw a sent friend request",
    ...sec,
  },
  remove: {
    method: "DELETE",
    path: "/api/me/friends/:friendshipId",
    pathParams: z.object({ friendshipId: z.string() }),
    body: c.noBody(),
    responses: { 200: SuccessSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Remove a friend",
    ...sec,
  },
});

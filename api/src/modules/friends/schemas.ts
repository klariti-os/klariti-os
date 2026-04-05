import { z } from "zod";

export const FriendRequestStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "withdrawn",
]);

export const FriendSchema = z.object({
  friendship_id: z.string().uuid(),
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const FriendRequestSchema = z.object({
  id: z.string().uuid(),
  from_id: z.string(),
  to_id: z.string(),
  status: FriendRequestStatusSchema,
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const FriendRequestUserSchema = z.object({
  request_id: z.string().uuid(),
  status: FriendRequestStatusSchema,
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const SentRequestUserSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum(["pending", "withdrawn"]),
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const SendFriendRequestBodySchema = z.object({
  addressee_id: z.string(),
});

export const FriendRequestActionBodySchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export type Friend = z.infer<typeof FriendSchema>;
export type FriendRequest = z.infer<typeof FriendRequestSchema>;
export type FriendRequestUser = z.infer<typeof FriendRequestUserSchema>;
export type SentRequestUser = z.infer<typeof SentRequestUserSchema>;
export type SendFriendRequestBody = z.infer<typeof SendFriendRequestBodySchema>;

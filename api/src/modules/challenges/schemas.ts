import { z } from "zod";

export const GoalSchema = z.enum(["FOCUS", "WORK", "STUDY", "CASUAL"]);
export const ParticipantStatusSchema = z.enum(["active", "paused", "completed"]);
export const ChallengeRequestStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "withdrawn",
  "ignored",
]);

export const ChallengeSchema = z.object({
  id: z.string().uuid(),
  creator_id: z.string(),
  name: z.string(),
  goal: GoalSchema,
  ends_at: z.string().nullable(),
  pause_threshold: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const ChallengeWithStatusSchema = ChallengeSchema.extend({
  creator_name: z.string(),
  participant_status: ParticipantStatusSchema,
  joined_at: z.string().nullable(),
});

export const ParticipantSchema = z.object({
  challenge_id: z.string().uuid(),
  user_id: z.string(),
  status: ParticipantStatusSchema,
  joined_at: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const ChallengeRequestSchema = z.object({
  id: z.string().uuid(),
  challenge_id: z.string().uuid(),
  from_id: z.string(),
  to_id: z.string(),
  status: ChallengeRequestStatusSchema,
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const CreateChallengeBodySchema = z.object({
  name: z.string().min(1),
  goal: GoalSchema,
  ends_at: z.string().optional(),
  pause_threshold: z.number().optional(),
});

export const UpdateChallengeBodySchema = z.object({
  name: z.string().optional(),
  goal: GoalSchema.optional(),
  ends_at: z.string().nullable().optional(),
  pause_threshold: z.number().nullable().optional(),
});

export const InviteToChallengeBodySchema = z.object({
  user_id: z.string(),
});

export const ChallengeRequestActionBodySchema = z.object({
  action: z.enum(["accept", "decline", "ignore"]),
});

export const ChallengeStatusBodySchema = z.object({
  status: z.enum(["active", "paused"]),
});

export type Goal = z.infer<typeof GoalSchema>;
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type ChallengeWithStatus = z.infer<typeof ChallengeWithStatusSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type ChallengeRequest = z.infer<typeof ChallengeRequestSchema>;
export type CreateChallengeBody = z.infer<typeof CreateChallengeBodySchema>;
export type UpdateChallengeBody = z.infer<typeof UpdateChallengeBodySchema>;

import type { CreateChallengeBody, UpdateChallengeBody } from "@klariti/contracts";
import { challengesRepository } from "../repositories/challenges.repository.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const challengesService = {
  listForUser: (userId: string) => challengesRepository.listForUser(userId),

  async create(userId: string, body: CreateChallengeBody) {
    const [challenge] = await challengesRepository.create({ creator_id: userId, ...body });
    await challengesRepository.addParticipant(challenge.id, userId);
    return challenge;
  },

  async getForParticipant(challengeId: string, userId: string) {
    if (!UUID_RE.test(challengeId)) return null;
    const [row] = await challengesRepository.findParticipant(challengeId, userId);
    if (!row) return null;
    return { challenge: row.challenges, participant: row.challenge_participants };
  },

  async getAsCreator(challengeId: string, userId: string) {
    if (!UUID_RE.test(challengeId)) return null;
    const [challenge] = await challengesRepository.findById(challengeId);
    if (!challenge || challenge.creator_id !== userId) return null;
    return challenge;
  },

  async update(challengeId: string, data: UpdateChallengeBody) {
    const [updated] = await challengesRepository.update(challengeId, data);
    return updated;
  },

  delete: (challengeId: string) => challengesRepository.delete(challengeId),

  async leave(challengeId: string, userId: string) {
    await challengesRepository.removeParticipant(challengeId, userId);
  },

  async invite(challengeId: string, fromId: string, inviteeId: string) {
    const [userA, userB] = fromId < inviteeId ? [fromId, inviteeId] : [inviteeId, fromId];
    const [friendship] = await challengesRepository.findActiveFriendship(userA, userB);
    if (!friendship) return { error: "Not friends with this user" as const, status: 403 as const };

    const [existing] = await challengesRepository.findExistingParticipant(challengeId, inviteeId);
    if (existing) return { error: "User is already a participant" as const, status: 400 as const };

    const [pending] = await challengesRepository.findPendingInvite(challengeId, inviteeId);
    if (pending) return { error: "A pending invite already exists" as const, status: 400 as const };

    const [req] = await challengesRepository.createRequest(challengeId, fromId, inviteeId);
    return { data: req };
  },

  updateParticipantStatus: (challengeId: string, userId: string, status: "active" | "paused") =>
    challengesRepository.updateParticipantStatus(challengeId, userId, status),

  listReceivedRequests: (userId: string) =>
    challengesRepository.listReceivedRequests(userId),

  listSentRequests: (userId: string) =>
    challengesRepository.listSentRequests(userId),

  async withdrawRequest(requestId: string, userId: string) {
    const [req] = await challengesRepository.findRequest(requestId);
    if (!req || req.from_id !== userId) return { error: "Not found or not the sender" as const };
    if (req.status !== "pending") return { error: "Request is no longer pending" as const };
    const [updated] = await challengesRepository.updateRequest(requestId, "withdrawn");
    return { data: updated };
  },

  async respondToRequest(requestId: string, userId: string, action: "accept" | "decline" | "ignore") {
    const [req] = await challengesRepository.findPendingRequest(requestId);
    if (!req || req.to_id !== userId) return { error: "Not found or not the recipient" as const };

    const status = action === "accept" ? "accepted" : action === "decline" ? "declined" : "ignored";
    const [updated] = await challengesRepository.updateRequest(requestId, status);

    if (action === "accept") {
      await challengesRepository.addParticipant(req.challenge_id, userId);
    }

    return { data: updated };
  },
};

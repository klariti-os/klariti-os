import { friendsRepository } from "./repository.js";

type User = { id: string; name: string; email: string; image: string | null; createdAt: Date };

function formatFriend(
  friendship: { id: string; user_a_id: string; user_b_id: string },
  userId: string,
  users: User[],
) {
  const friendId = friendship.user_a_id === userId ? friendship.user_b_id : friendship.user_a_id;
  const user = users.find((value) => value.id === friendId)!;
  return {
    friendship_id: friendship.id,
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
  };
}

export const friendsService = {
  async listFriends(userId: string) {
    const friendships = await friendsRepository.listActiveFriendships(userId);
    if (friendships.length === 0) return [];
    const otherIds = friendships.map((friendship) =>
      friendship.user_a_id === userId ? friendship.user_b_id : friendship.user_a_id,
    );
    const users = await friendsRepository.findUsersByIds(otherIds);
    return friendships.map((friendship) => formatFriend(friendship, userId, users as User[]));
  },

  async listSentRequests(userId: string) {
    const requests = await friendsRepository.listSentRequests(userId);
    if (requests.length === 0) return [];
    const users = await friendsRepository.findUsersByIds(requests.map((request) => request.to_id));
    return requests.map((request) => {
      const user = (users as User[]).find((value) => value.id === request.to_id)!;
      const status = request.status === "withdrawn" ? "withdrawn" : "pending";
      return {
        request_id: request.id,
        status: status as "pending" | "withdrawn",
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
      };
    });
  },

  async listReceivedRequests(userId: string) {
    const requests = await friendsRepository.listReceivedRequests(userId);
    if (requests.length === 0) return [];
    const users = await friendsRepository.findUsersByIds(requests.map((request) => request.from_id));
    return requests.map((request) => {
      const user = (users as User[]).find((value) => value.id === request.from_id)!;
      return {
        request_id: request.id,
        status: request.status,
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
      };
    });
  },

  async sendRequest(fromId: string, toId: string) {
    if (fromId === toId) return { error: "Cannot friend yourself" as const };

    const [userA, userB] = fromId < toId ? [fromId, toId] : [toId, fromId];
    const [friendship] = await friendsRepository.findActiveFriendship(userA, userB);
    if (friendship) return { error: "Already friends" as const };

    const [existing] = await friendsRepository.findPendingRequest(fromId, toId);
    if (existing) return { error: "A pending request already exists" as const };

    const [request] = await friendsRepository.createRequest(fromId, toId);
    return { data: request };
  },

  async respondToRequest(requestId: string, userId: string, action: "accept" | "decline") {
    const [request] = await friendsRepository.findPendingRequestById(requestId);
    if (!request || request.to_id !== userId) {
      return { error: "Not found or not the recipient" as const };
    }

    const [updated] = await friendsRepository.updateRequest(
      requestId,
      action === "accept" ? "accepted" : "declined",
    );

    if (action === "accept") {
      const [userA, userB] = updated.from_id < updated.to_id
        ? [updated.from_id, updated.to_id]
        : [updated.to_id, updated.from_id];
      await friendsRepository.upsertFriendship(userA, userB);
    }

    return { data: updated };
  },

  async withdrawRequest(requestId: string, userId: string) {
    const [request] = await friendsRepository.findRequestById(requestId);
    if (!request || request.from_id !== userId) {
      return { error: "Not found or not the sender" as const };
    }
    if (request.status !== "pending") return { error: "Request is no longer pending" as const };
    const [updated] = await friendsRepository.updateRequest(requestId, "withdrawn");
    return { data: updated };
  },

  async removeFriend(friendshipId: string, userId: string) {
    const [updated] = await friendsRepository.removeFriendship(friendshipId, userId);
    if (!updated) return { error: "Not found" as const };
    return { data: { success: true } };
  },
};

import "server-only";

import API_BASE from "@/lib/configs/api";
import { client, getApiTagByMessage } from "@klariti/api-client";

client.setConfig({
  baseUrl: API_BASE,
});

export type PublicTagDetails = {
  tagId: string;
  tagName: string;
  ownerName: string | null;
  status: "active" | "revoked";
};

export async function getPublicTagDetails(message: string): Promise<PublicTagDetails | null> {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) return null;

  const { data, error, response } = await getApiTagByMessage({
    path: { message: trimmedMessage },
  });

  if (response?.status === 404) {
    return null;
  }

  if (error || !data?.tag_id || !data.tag_name || !data.status) {
    throw new Error("Failed to load public tag details.");
  }

  return {
    tagId: data.tag_id,
    tagName: data.tag_name,
    ownerName: data.owner_name ?? null,
    status: data.status,
  };
}

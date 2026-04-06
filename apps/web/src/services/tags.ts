import "server-only";

import { createApiClient } from "@klariti/api/client";
import API_BASE from "@/lib/configs/api";

const serverApi = createApiClient({ baseUrl: API_BASE });

export type PublicTagDetails = {
  tagId: string;
  tagName: string;
  ownerName: string | null;
  status: "active" | "revoked";
};

export async function getPublicTagDetails(message: string): Promise<PublicTagDetails | null> {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) return null;

  const res = await serverApi.public.getTag({ params: { message: trimmedMessage } });

  if (res.status === 404) return null;

  if (res.status !== 200 || !res.body.tag_id || !res.body.tag_name || !res.body.status) {
    throw new Error("Failed to load public tag details.");
  }

  return {
    tagId: res.body.tag_id,
    tagName: res.body.tag_name,
    ownerName: res.body.owner_name ?? null,
    status: res.body.status,
  };
}

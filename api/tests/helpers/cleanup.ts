import { db, authUser, like } from "@klariti/database";

/** Delete all test users (cascades to challenges, friendships, etc.) */
export async function cleanupTestUsers() {
  await db.delete(authUser).where(like(authUser.email, "%@test.klariti.dev"));
}

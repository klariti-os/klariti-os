import { db, authUser, ktagsTable, like, eq } from "@klariti/database";

/** Delete all test users (cascades to challenges, friendships, etc.) */
export async function cleanupTestUsers() {
  await db.delete(ktagsTable).where(eq(ktagsTable.tag_type, "test-suite"));
  await db.delete(authUser).where(like(authUser.email, "%@test.klariti.dev"));
}

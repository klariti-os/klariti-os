import { db, authUser, inArray, ktagsTable, like } from "@klariti/database";
import { hashKtagUid } from "../../src/lib/ktag-issuance.js";

const testKtagUidHashes = [
  "04:A1:B2:C3:D4:E5:F6",
  "04:A1:B2:C3:D4:E5:F7",
  "04:A1:B2:C3:D4:E5:F8",
  "04:A1:B2:C3:D4:E5:F9",
  "04:A1:B2:C3:D4:E5:FA",
  "04:A1:B2:C3:D4:E5:FB",
  "04:A1:B2:C3:D4:E5:FD",
  "04:A1:B2:C3:D4:E6:00",
  "04:A1:B2:C3:D4:E6:01",
].map(hashKtagUid);

/** Delete all test users (cascades to challenges, friendships, etc.) */
export async function cleanupTestUsers() {
  await db.delete(ktagsTable).where(inArray(ktagsTable.uid_hash, testKtagUidHashes));
  await db.delete(authUser).where(like(authUser.email, "%@test.klariti.dev"));
}

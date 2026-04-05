import { initContract } from "@ts-rest/core";
import { authContract } from "./auth/auth.contract.js";
import { meContract } from "./me/me.contract.js";
import { challengesContract } from "./challenges/challenges.contract.js";
import { friendsContract } from "./friends/friends.contract.js";
import { ktagsContract, adminKtagsContract, publicContract } from "./ktags/ktags.contract.js";
import { classifyContract } from "./classify/classify.contract.js";

const c = initContract();

export const contract = c.router({
  auth: authContract,
  me: meContract,
  challenges: challengesContract,
  friends: friendsContract,
  ktags: ktagsContract,
  adminKtags: adminKtagsContract,
  classify: classifyContract,
  public: publicContract,
});

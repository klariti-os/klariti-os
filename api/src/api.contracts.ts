import { initContract } from "@ts-rest/core";
import { authContract } from "./modules/auth/contract.ts";
import { meContract } from "./modules/me/contract.ts";
import { challengesContract } from "./modules/challenges/contract.ts";
import { friendsContract } from "./modules/friends/contract.ts";
import {
  ktagsContract,
  adminKtagsContract,
  publicContract,
} from "./modules/ktags/contract.ts";
import { classifyContract } from "./modules/classify/contract.ts";

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

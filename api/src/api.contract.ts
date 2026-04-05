import { initContract } from "@ts-rest/core";
import { authContract } from "./modules/auth/contract.js";
import { meContract } from "./modules/me/contract.js";
import { challengesContract } from "./modules/challenges/contract.js";
import { friendsContract } from "./modules/friends/contract.js";
import {
  ktagsContract,
  adminKtagsContract,
  publicContract,
} from "./modules/ktags/contract.js";
import { classifyContract } from "./modules/classify/contract.js";

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

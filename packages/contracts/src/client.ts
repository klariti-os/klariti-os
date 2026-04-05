import { initClient, type InitClientArgs } from "@ts-rest/core";
import { contract } from "./contract.js";

export type ApiClientArgs = Pick<InitClientArgs, "baseUrl" | "baseHeaders" | "credentials">;

export function createApiClient(args: ApiClientArgs) {
  return initClient(contract, {
    credentials: "include",
    ...args,
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;

import { initClient, type InitClientArgs } from "@ts-rest/core";
import { contract } from "./api.contracts.js";

export type ApiClientArgs = Pick<InitClientArgs, "baseUrl" | "baseHeaders" | "credentials">;

export function createApiClient(args: ApiClientArgs) {
  return initClient(contract, {
    ...args,
    credentials: args.credentials ?? "include",
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;

import { initContract } from "@ts-rest/core";
import { ErrorSchema } from "../common/errors.schemas.js";
import {
  AuthResponseSchema,
  SignInBodySchema,
  SignUpBodySchema,
} from "./auth.schemas.js";

const c = initContract();

const auth = { metadata: { tags: ["Auth"] } as const };

export const authContract = c.router({
  signUp: {
    method: "POST",
    path: "/api/sign-up",
    body: SignUpBodySchema,
    responses: { 200: AuthResponseSchema, 400: ErrorSchema, 422: ErrorSchema },
    summary: "Create an account",
    ...auth,
  },
  signIn: {
    method: "POST",
    path: "/api/sign-in",
    body: SignInBodySchema,
    responses: { 200: AuthResponseSchema, 400: ErrorSchema, 401: ErrorSchema, 403: ErrorSchema },
    summary: "Sign in with email and password",
    ...auth,
  },
});

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { toNodeHandler } from "better-auth/node";
import { db, authUser, authSession, authAccount, authVerification } from "@klariti/database";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // TODO: replace with real email provider (Resend, SendGrid, etc.)
      console.log(`[auth] Verification email for ${user.email}: ${url}`);
    },
  },
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  plugins: [bearer()],
});

export type Session = typeof auth.$Infer.Session;
export { toNodeHandler };

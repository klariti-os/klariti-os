const port = Number(process.env.PORT ?? 4200);
const ktagSigVersion = Number(process.env.KTAG_SIG_VERSION ?? 1);

if (!Number.isInteger(ktagSigVersion) || ktagSigVersion < 1) {
  throw new Error("KTAG_SIG_VERSION must be a positive integer.");
}

export const config = {
  port,
  host: process.env.HOST ?? "0.0.0.0",

  // Public-facing URL of this API server.
  // Must match BETTER_AUTH_URL in the auth package.
  appUrl: process.env.APP_URL ?? `http://localhost:${port}`,

  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  ktagBaseUrl: process.env.KTAG_BASE_URL ?? "https://klariti.so",
  ktagSigVersion,
  ktagSigningPrivateKey: process.env.KTAG_SIGNING_PRIVATE_KEY?.trim() ?? "",
} as const;

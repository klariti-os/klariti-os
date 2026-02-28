const port = Number(process.env.PORT ?? 4200);

export const config = {
  port,
  host: process.env.HOST ?? "0.0.0.0",

  // Public-facing URL of this API server.
  // Must match BETTER_AUTH_URL in the auth package.
  appUrl: process.env.APP_URL ?? `http://localhost:${port}`,

  corsOrigins: (
    process.env.CORS_ORIGINS ??
    `http://localhost:${port},http://127.0.0.1:${port},http://localhost:3001`
  )
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
} as const;

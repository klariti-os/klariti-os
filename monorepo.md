# Klariti OS Monorepo

## Structure
- `apps/web` - Next.js 14 frontend (`@klariti/web`)
- `apps/extension` - WXT browser extension (`@klariti/xt`)
- `api/` - Fastify API server (`@klariti/api`, port 4200)
- `packages/auth` - Better Auth package (`@klariti/auth`)
- `packages/database` - Drizzle ORM + pg (`@klariti/database`)
- `packages/typescript-config` - Shared TS config (`@repo/typescript-config`)
- `packages/ui` - UI components
- `packages/eslint-config` - Shared ESLint config

## Package Manager
- pnpm with workspaces (workspaces: `apps/*`, `packages/*`, `api`)
- Turbo for task running

## Auth Package (`@klariti/auth`)
- Split exports: `@klariti/auth/server` and `@klariti/auth/client`
- `server.ts` exports: `auth`, `toNodeHandler`, `Session` type
- `client.ts` exports: `authClient`, `signIn`, `signUp`, `signOut`, `useSession`
- Env vars required: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Uses Drizzle adapter with pg provider

## API (Fastify)
- Auth routes registered at `/api/auth/*` via `toNodeHandler`
- `api/src/auth.ts` is the Fastify plugin for better-auth
- `tsx watch src/server.ts` for dev

## Naming Convention
- All workspace packages use `@klariti/*` prefix (not `@repo/*`)
- Exception: typescript-config stays as `@repo/typescript-config`

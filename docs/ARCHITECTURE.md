# Architecture

Technical decisions, data models, and design rationale for the Klariti monorepo.

## Monorepo layout

Turborepo monorepo with pnpm workspaces (`apps/*`, `packages/*`, `api`). All workspace packages use the `@klariti/*` prefix — except `typescript-config` which stays as `@repo/typescript-config`.

```
apps/
  web/          # Next.js dashboard (@klariti/web)
  extension/    # MV3 browser extension (@klariti/xt)
  ios/          # SwiftUI iOS companion app

api/            # Fastify API server (@klariti/api, port 4200)

packages/
  database/     # Drizzle ORM schema + pg client (@klariti/database)
  auth/         # Better Auth server + client split exports (@klariti/auth)
  api-client/   # typed fetch client for the API
  url-class/    # URL → category classifier
  ui/           # shared UI components
  eslint-config/
  typescript-config/
```

## API

Fastify on port 4200. Plugin-first: auth, session verification, and Swagger are registered as plugins before routes. Routes are flat files named `<domain>.<resource>.ts` (e.g. `me.friends.ts`, `me.challenges.ts`).

Auth is handled by Better Auth with a Drizzle adapter. The bearer plugin enables token-based auth for mobile and extension clients. Sessions are attached to every request via a `verifySession` preHandler decorator.

Dev: `tsx watch src/server.ts`

## Auth package

`@klariti/auth` has split exports to keep server-only code out of client bundles:
- `@klariti/auth/server` — `auth`, `toNodeHandler`, `Session` type
- `@klariti/auth/client` — `authClient`, `signIn`, `signUp`, `signOut`, `useSession`

## Data models

### Challenges

A challenge is the canonical entity. A solo "intent" is just a challenge with one participant and no deadline — the distinction is UX framing, not a different data shape.

```ts
interface Challenge {
  id: string
  creator_id: string
  name: string
  goal: "FOCUS" | "WORK" | "STUDY" | "CASUAL"
  ends_at?: Date           // set = time-bound
  pause_threshold?: number // 0.0–1.0, group pause condition
  created_at: Date
  updated_at: Date
}

// One row per (challenge, user). Composite PK — a user joins a challenge once.
// Only created once an invite is accepted. Creator is auto-inserted as "active" on challenge creation.
interface ChallengeParticipant {
  challenge_id: string
  user_id: string
  status: "active" | "paused" | "completed"
  joined_at?: Date
  created_at: Date
}

// One row per invite. Mirrors the friend_requests design.
interface ChallengeRequest {
  id: string
  challenge_id: string
  from_id: string  // always the challenge creator
  to_id: string
  status: "pending" | "accepted" | "declined" | "withdrawn" | "ignored"
  created_at: Date
  updated_at: Date
}
```

Challenges use the same two-table pattern as friendships. The `challenge_requests` table is the invite audit log; `challenge_participants` only contains users who have actively joined.

**Invite flow**: `POST /:id/invite` creates a `challenge_request` (creator-only, friendship required). The recipient responds via `PATCH /requests/:requestId` with `accept`, `decline`, or `ignore`. Accepting inserts a participant row with `status = "active"`. Declining and ignoring leave no participant row.

**Ignore vs decline**: both prevent joining, but `ignore` is surfaced separately so the UI can present it differently (e.g. silently dismiss vs explicitly decline).

**Withdrawal**: the sender can withdraw a pending invite (`DELETE /requests/:requestId`). Withdrawn invites are immediately hidden from the recipient's `GET /requests/received` list (filtered to `status = 'pending'` only).

**Prehandlers**: `ensureChallengeCreator`, `ensureChallengeParticipant`, `ensureChallengeRecipient`, and `ensureChallengeSender` attach the resolved entity to the request object and short-circuit with the appropriate 4xx before the handler runs.

### Friendships (two-table model)

Friendships use two separate tables to cleanly separate the canonical relationship state from the per-request audit log. This handles the re-add case correctly: if two users unfriend and one re-sends a request, the friendship row is reactivated (not duplicated) while a new request row is appended to the log.

```ts
// Canonical relationship. user_a_id < user_b_id enforced at application layer.
// Unique constraint on (user_a_id, user_b_id). Persists via soft-delete.
interface Friendship {
  id: string
  user_a_id: string
  user_b_id: string
  status: "active" | "removed"
  created_at: Date
  updated_at: Date
}

// One row per request. Directional. Multiple requests between the same pair are allowed.
interface FriendRequest {
  id: string
  from_id: string
  to_id: string
  status: "pending" | "accepted" | "declined" | "withdrawn"
  created_at: Date
  updated_at: Date
}
```

**Withdrawal**: the sender can withdraw a pending request (`DELETE /requests/:requestId`). Withdrawn requests are hidden from the recipient immediately — `GET /requests/received` filters to `status = 'pending'` only. The sender can re-send a request after withdrawing because the duplicate check only blocks an actively `pending` request.

**Privacy rule**: the sender's view of sent requests masks `declined` as `pending` to prevent inferring rejection. `withdrawn` is shown as-is since the sender initiated it.

**Accept flow**: accepting a request upserts the `friendships` row via `ON CONFLICT DO UPDATE`, which either creates the friendship or reactivates a previously removed one.

### Ktags

Physical NFC tags registered to a user. The tag URL encodes a unique `embedded_id`. On iOS, the app verifies the payload domain (`klariti.so/tag/<id>`) before accepting a scan.

```ts
interface Ktag {
  embedded_id: string  // unique ID from the tag URL
  payload: string      // full URL written to the NFC tag
  user_id: string
  label?: string
  created_at: Date
}
```

## iOS app

The iOS companion enforces focus sessions using NFC tags + native Screen Time (FamilyControls). No VPN or proxy required.

**Session flow:**
1. User selects apps to block on first launch
2. Tap **Start Focus** → scan ktag → apps blocked, session locked to that specific tag
3. To end the session, scan the **same** tag — any other tag is rejected

**Key files:**

```
apps/ios/klariti/
  Core/
    NFCScanner.swift        # NFC session handling + payload verification
    ScreenTimeManager.swift # FamilyControls shield management
  Models/
    AppStore.swift          # Observable state + all actions (single source of truth)
  Features/
    Home/HomeView.swift
    Locked/LockedView.swift
    Setup/AppSelectionView.swift
```

## Testing

Integration tests use Vitest with `app.inject()` (no real HTTP server). Tests run sequentially (`fileParallelism: false`) against the live database. Test users are identified by email pattern `%@test.klariti.dev` and cleaned up in `afterAll` via cascade delete.

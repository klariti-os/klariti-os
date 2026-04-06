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

Fastify on port 4200. Plugin-first: auth, session verification, and Swagger are registered as plugins before routes. Server features are organized as domain modules under `api/src/modules/`.

Auth is handled by Better Auth with a Drizzle adapter. The bearer plugin enables token-based auth for mobile and extension clients. Sessions are attached to every request via a `verifySession` preHandler decorator.

Dev: `tsx watch src/server.ts`

### Vercel deployment note

The `klariti-api` Vercel project uses the Fastify framework preset with `api/` as the root directory, and `api/src/server.ts` must stay as a plain Fastify entrypoint file.

Important constraint: do not export the Fastify instance from `api/src/server.ts` (for example `export const server = ...` or `export default server`). When that shape was introduced during the April 5, 2026 refactor, Vercel builds still succeeded, but runtime bootstrapping broke and requests started failing with errors like:

- `Invalid export found in module`
- `TypeError: fastify.register...`
- `504 INTERNAL_FUNCTION_INVOCATION_TIMEOUT`

The working pattern is:

- create the Fastify instance inside `api/src/server.ts`
- register plugins and routes there
- call `server.listen(...)` there
- do not export the instance

If Vercel suddenly starts timing out on `/` even though the build is green, check the `api/src/server.ts` entrypoint shape first before debugging route handlers or database calls.

### API modules

The API is organized by domain modules under `api/src/modules/<domain>/` rather than by technical layer. Each module keeps its own related concerns together:

```txt
api/src/modules/friends/
  contract.ts
  schemas.ts
  router.ts
  service.ts
  repository.ts
```

This keeps the ts-rest contract, request/response schemas, server route implementation, and domain logic close to each other so adding a route does not require editing a separate contracts package first.

### Client-safe exports

Client consumers import the shared API surface from `@klariti/api`, not from a separate contracts workspace package:

- `@klariti/api/contracts` — ts-rest contracts and shared schema/types
- `@klariti/api/client` — `createApiClient(...)`

These exports are intentionally limited to client-safe files so web and extension code can share the contract surface without importing Fastify, Better Auth server wiring, or database code.

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
interface ChallengeParticipant {
  challenge_id: string
  user_id: string
  status: "invited" | "active" | "paused" | "declined" | "completed"
  joined_at?: Date
  created_at: Date
}
```

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

Physical NFC tags issued by Klariti. Tags can exist as inventory before assignment, so ownership is nullable until a tag is issued to a user.

The NFC tag stores a full URL payload in the form `https://klariti.so/tag/<message>`. In this model:
- `tag_id` is a server-generated Klariti tag ID and is prefixed with `kt_`
- `payload` is the exact full URL written to the NFC tag, so it contains the `<message>`
- `uid_hash` binds the record to the physical NFC chip's hardware identifier without exposing the raw UID in normal API responses
- `signature` + `sig_version` support offline verification of issued tags in native clients
- the admin create endpoint accepts the raw NFC `uid`, and the server computes `tag_id`, `uid_hash`, `signature`, `sig_version`, and `payload`

This keeps the tag tappable in browsers while still letting the iOS app read the actual NFC identifier and verify that the physical tag matches the issued record.

```ts
interface Ktag {
  tag_id: string              // server-generated Klariti tag ID, prefixed with kt_
  uid_hash?: string           // hash of the physical tag UID / IDm
  payload: string             // full URL written to the NFC tag: https://klariti.so/tag/<message>
  signature?: string          // server-generated signature over issued tag data
  sig_version?: number        // signature / key version
  status: "active" | "revoked"
  owner_id?: string | null    // nullable: tag may exist in inventory before assignment
  label?: string
  tag_type?: "WALL" | "MOBILE" | "DESK"
  created_at: Date
  revoked_at?: Date
}
```

**Ownership model**: `owner_id` uses `ON DELETE SET NULL` so tags return to unassigned inventory if the owning user is removed.

**Issuance model**: all Klariti tag IDs use the `kt_` prefix and are generated server-side. Tag registration happens through `POST /api/admin/ktags`. The admin client submits only the raw NFC `uid` plus enum `tag_type`, and the server normalizes and hashes the UID, signs `v<sig_version>|<tag_id>|<uid_hash>` with its private key, generates a friendly two-word label, and writes the resulting message into the payload URL as `https://klariti.so/tag/v<sig_version>.<tag_id>.<signature>`.

**Mutable patch model**: `PATCH /api/admin/ktags/:tag_id` is intentionally narrow and only updates inventory / assignment fields:
- `status`
- `label`
- `tag_type`
- `owner_id` (including `null` to return a tag to inventory)

Server-managed issuance fields such as `uid_hash`, `payload`, `signature`, and `sig_version` are never client-patchable. `revoked_at` is also server-managed: revoking a tag stamps it automatically, and reactivating a tag clears it.

**Public resolution model**: the web landing flow resolves tags through `GET /api/tag/:message`. The API parses the signed `<message>` from the NFC URL, verifies that it matches a real issued tag, and returns the public-facing tag details needed by `klariti.so/tag/<message>`, including tag name, owner name when assigned, and current `status`.

**Verification model**:
- Web: the payload URL identifies the issued tag and can route to a Klariti page.
- iOS: the app reads the actual NFC hardware identifier exposed by Core NFC, compares it to the issued tag material, and can verify signed payloads locally with a bundled public key.

## iOS app

The iOS companion enforces focus sessions using NFC tags + native Screen Time (FamilyControls), and also includes built-in account + admin tooling. No VPN or proxy required.

**Account / role model**:
- the top-right profile entry routes to sign-in when signed out
- signed-in users see their profile details
- admin users see the NFC utility inside the same app, so there is no separate admin app

**Session flow:**
1. User selects apps to block on first launch
2. Tap **Start Focus** → scan ktag → apps blocked, session locked to that specific physical tag
3. To end the session, scan the **same** tag — any other tag is rejected

**Admin NFC utility**:
- `Provision`: scans a physical tag, registers it through the admin API if needed, recovers the existing record if the UID is already known, compares the live on-tag payload with Klariti's expected payload, and can burn the Klariti URL onto the tag
- `Patch`: scans a registered tag by UID, loads its existing ktag record, and lets admins edit only `status`, `label`, and `tag_type`
- `Inspect`: reads the raw iPhone-visible NFC details, including UID / identifier source, NDEF status, capacity, payload, and decoded records

**Write flow note**: provisioning is intentionally a two-session NFC flow on iOS. The app reads first, completes registration or recovery, then starts a write session to burn the Klariti payload if the tag is blank or mismatched.

**Key files:**

```
apps/ios/klariti/
  Core/
    KlaritiAPIClient.swift  # embedded iOS API client for auth + admin tag actions
    NFCScanner.swift        # NFC session handling + payload verification
    NFCNDEFWriter.swift     # NDEF URL payload writing for provisioning
    ScreenTimeManager.swift # FamilyControls shield management
  Models/
    AppStore.swift          # Observable state + all actions (single source of truth)
  Features/
    Home/HomeView.swift
    Locked/LockedView.swift
    Profile/ProfileView.swift
    Setup/AppSelectionView.swift
    Utility/NFCUtilityView.swift
```

## Testing

Integration tests use Vitest with `app.inject()` (no real HTTP server). Tests run sequentially (`fileParallelism: false`) against the live database. Test users are identified by email pattern `%@test.klariti.dev` and cleaned up in `afterAll` via cascade delete.

# Klariti

Klariti is a **local-first** layer that sits between you and the web and helps you use the internet with more intention.

The internet was meant to strengthen human connection, speed up learning, and support growth. Over time, it became one of the most distracting environments ever built. Most of what we see online is shaped by engagement algorithms we do not control. Klariti flips that. It prioritizes **wellbeing, focus, and user agency**.

At the core is the **Gray Engine**.

It does not treat the internet as “good vs bad”. It treats content as **context-dependent**. The same platform can help you learn in one moment and wreck your focus in the next. Klariti responds to that reality by applying lightweight, reversible interventions.

## What the Gray Engine does

Given:
- your goal (study, work, casual)
- your rules (what you allow, what you want to avoid)
- a sanitized view of the page context (title, headings, known modules)

It returns a structured action plan like:
- **HIDE** a distracting module
- **BLUR** or **GRAYSCALE** low-value sections
- **HIGHLIGHT** what matches your goal
- **DELAY** access (optional)
- **REROUTE** to a calmer view (optional)

Everything is designed to be:
- **predictable**
- **explainable**
- **reversible**
- **user-controlled**

## Core concepts

### Intents
Everything in Klariti starts as an intent. An intent is a named configuration that bundles a goal with a set of rules — it tells the Gray Engine how to behave and can be toggled on or off at any time.

### Challenges
A challenge is an intent with a commitment layer. Any intent can be turned into a challenge by adding:

- **Time-bound** — ends after N days, or at a set date
- **Group** — shared with others, with a collective pause condition (e.g. pauses for everyone once 50% of participants choose to pause)

A challenge is the canonical entity. A solo "intent" is just a challenge with one participant and no deadline — the distinction is UX framing, not a different data shape.

The extension fetches the user's active challenge (via their participant row) in a single call.

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

// One row per (challenge, user). Composite PK.
interface ChallengeParticipant {
  challenge_id: string
  user_id: string
  status: "invited" | "active" | "paused" | "declined" | "completed"
  joined_at?: Date
  created_at: Date
}

// Symmetric friendship. user_a_id < user_b_id (canonical ordering, enforced in app).
interface Friendship {
  id: string
  user_a_id: string
  user_b_id: string
  requester_id: string  // who sent the request
  status: "pending" | "accepted" | "blocked"
  created_at: Date
  updated_at: Date
}

// Physical NFC tag registered to a user
interface Ktag {
  embedded_id: string  // unique ID from the tag URL: klariti.so/tag/<embedded_id>
  payload: string      // full URL written to the tag
  user_id: string
  label?: string
  created_at: Date
}
```

## Scope (prototype)

This repo focuses on a working prototype that demonstrates **context-aware mediation** inside a desktop browser.

In scope:
- Desktop browser extension that observes and modifies page content
- Web dashboard for intents, challenges, rules, and a global kill switch
- API layer that turns context + rules into a constrained action plan
- Local storage for settings and basic state
- Optional cloud sync for configuration portability (stretch)

Out of scope:
- Mobile browser support
- Replacing platform recommendation algorithms
- Commercial deployment or large-scale user studies
- Always-on, heavy AI analysis of every page

## Monorepo layout

Turborepo monorepo. Fastify for the API layer using a plugin-first structure.

```txt
apps/
  web/          # Next.js dashboard
  extension/    # MV3 browser extension (DOM observation + enforcement)
  ios/          # SwiftUI iOS companion app

api/            # Fastify API (plugin-first, auth + intent routes)

packages/
  database/     # Drizzle ORM schema + pg client
  api-client/   # typed fetch client for the API
  url-class/    # URL → category classifier
  ui/           # shared UI components
  auth/         # Better Auth (server + client split exports)
  eslint-config/
  typescript-config/
```

## iOS application

The Klariti iOS app is a companion tool for enforcing focus sessions on your iPhone using physical NFC tags (ktags).

**How it works:**
1. On first launch, select the apps to block during focus sessions
2. Tap **Start Focus** — the app prompts you to scan your ktag (an NFC tag with a `klariti.so/tag/<id>` URL)
3. Selected apps are blocked via Screen Time / FamilyControls and the device enters Locked state
4. To end the session, scan the **same** tag — any other tag is rejected

**Key features:**
- NFC-gated lock/unlock — no software bypass
- App blocking via native Screen Time (no VPN or proxy required)
- Payload verification: only tags matching `klariti.so/tag/<id>` are accepted
- Session-bound: the exact tag used to lock is the only one that can unlock
- NFC errors are surfaced directly in the system NFC sheet — no extra in-app dialogs

**Stack:** SwiftUI · CoreNFC · FamilyControls / ScreenTime

```txt
apps/ios/klariti/
  Core/
    NFCScanner.swift        # NFC session handling + payload verification
    ScreenTimeManager.swift # FamilyControls shield management
  Models/
    AppStore.swift          # Observable state + all actions (single source of truth)
  Features/
    Home/HomeView.swift           # Ready state — start focus
    Locked/LockedView.swift       # Locked state — scan to unlock
    Setup/AppSelectionView.swift  # First-run app selection
```

## Team members
- Ariella: - UI/UX
- Benjamin - systems
- Ebuka - full stack engineer
- Myah - Data 
- Praveen - AI 
- ignas - vibes
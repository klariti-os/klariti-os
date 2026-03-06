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

Under the hood, intents and challenges are the same thing. A plain intent is solo with no end date — active until the user turns it off. A challenge is an intent with a deadline, a group, or both.

The distinction is derived, not stored. An intent with `ends_at` and/or `pause_threshold` set is a challenge. Without them, it's a plain intent. Same data shape, different UX framing.

Each intent owns a set of rules. A rule maps a URL pattern to an action the Gray Engine should take. The extension fetches the active intent with its rules in a single call — everything it needs to enforce the user's configuration.

```ts
interface Intent {
  id: string
  user_id: string
  name: string
  goal: "FOCUS" | "WORK" | "STUDY" | "CASUAL"
  is_active: boolean
  ends_at?: Date        // set = challenge
  pause_threshold?: number  // 0.0–1.0, group pause condition
  created_at: Date
  updated_at: Date
}

interface Rule {
  id: string
  intent_id: string     // belongs to an intent
  url_pattern: string   // "youtube.com", "*.reddit.com"
  action: "BLOCK" | "BLUR" | "DELAY" | "HIGHLIGHT" | "HIDE"
  target?: string       // "feed", "sidebar" — null = whole page
  is_enabled: boolean
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

This is a Turborepo monorepo. Fastify is used for the API layer using a plugin-first structure.

```txt
apps/
  api/                      # Fastify API + proxy layer (decision router)
  dashboard/                # Next.js dashboard (rules, profiles, kill switch)
  extension/                # MV3 extension (DOM observation + enforcement)

packages/
  grey-engine/              # core decision logic (rules + scoring)
  url-classifier/           # URL -> category (ex: YouTube URL -> category)
  youtube-intel/            # YouTube metadata parsing (optional split)
  shared/                   # shared types, schemas, utils


## Team members 
- Ariella: - UI/UX
- Benjamin - systems
- Ebuka - full stack engineer
- Myah - Data 
- Praveen - AI 
- ignas - vibes
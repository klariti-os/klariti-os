# Klariti

Klariti is a **local-first** layer that sits between you and the web and helps you use the internet with more intention.

The internet was meant to strengthen human connection, speed up learning, and support growth. Over time, it became one of the most distracting environments ever built. Most of what we see online is shaped by engagement algorithms we do not control. Klariti flips that. It prioritizes **wellbeing, focus, and user agency**.

## What it does

At the core is the **Gray Engine** — a context-aware system that decides how to modify a webpage based on what you are trying to do right now. It does not treat the internet as "good vs bad". It treats content as context-dependent. The same platform can help you learn in one moment and wreck your focus in the next.

Given your current goal and rules, the Gray Engine can:
- Hide or blur distracting sections of a page
- Highlight content that matches your goal
- Delay or reroute access to low-value destinations

Everything is predictable, explainable, reversible, and user-controlled.

## Key concepts

**Intents** — the basic unit of configuration. An intent bundles a goal (focus, work, study, casual) with a set of rules that tell the Gray Engine how to behave. Intents can be toggled on or off at any time.

**Challenges** — an intent with a commitment layer. Challenges can be time-bound (ends after N days) or shared with a group (pauses for everyone once enough participants choose to pause). A solo intent and a group challenge are the same underlying concept — the distinction is in framing, not data.

**Ktags** — physical NFC tags that gate focus sessions on iOS. Tap to lock, tap the same tag to unlock. No software bypass.

**Friends** — users can add each other to share challenges and accountability.

## Platforms

| Platform | Purpose |
|----------|---------|
| Browser extension | Observes and modifies page content in real time |
| Web dashboard | Manage intents, challenges, and rules |
| iOS app | NFC-gated focus sessions with native app blocking |
| API | Orchestrates context classification and rule enforcement |

## Getting started

**Prerequisites:** Node.js, pnpm, a PostgreSQL database (we use [Neon](https://neon.tech)).

```bash
# Install dependencies
pnpm install

# Copy env and fill in values
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Start everything in dev mode
pnpm dev
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret for session signing |
| `BETTER_AUTH_URL` | Public URL of the API server (e.g. `http://localhost:4200`) |
| `APP_URL` | Same as `BETTER_AUTH_URL` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins |

### Running individual apps

```bash
pnpm --filter @klariti/api dev       # API only (port 4200)
pnpm --filter @klariti/web dev       # Web dashboard
pnpm --filter @klariti/api test      # API integration tests
```

## Prototype scope

In scope:
- Desktop browser extension (context-aware page modification)
- Web dashboard (intents, challenges, rules, kill switch)
- API layer (context + rules → action plan)
- iOS companion app (NFC-gated focus sessions)

Out of scope:
- Mobile browser support
- Replacing platform recommendation algorithms
- Commercial deployment or large-scale user studies
- Always-on, heavy AI analysis of every page

## Team

| Name | Role |
|------|------|
| Ariella | UI/UX |
| Benjamin | Systems |
| Ebuka | Full-stack |
| Myah | Data |
| Praveen | AI |
| Ignas | Vibes |

---

For technical architecture, data models, and design decisions see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

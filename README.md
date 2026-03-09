# Klariti

Klariti is an **antisocial social platform** — it uses the social dynamics that keep you hooked on the internet to help you spend less time on it.

Most apps compete for your attention. Klariti does the opposite. It gives you the tools to set intentions, block what pulls you off course, and hold each other accountable — without feeding you a feed.

## The idea

The internet stopped being a tool and became an environment designed to keep you inside it. The social mechanics that power that — streaks, challenges, peer pressure, shared commitments — are not inherently bad. Klariti borrows them and points them at focus instead of engagement.

You set a goal. You invite friends into a challenge. You use a physical NFC tag to lock your phone. The social layer is there to make it stick, not to pull you back in.

## Key concepts

**Intents** — the basic unit. An intent bundles a goal (focus, work, study, casual) with rules for the Gray Engine. Toggle on or off at any time.

**Challenges** — an intent with commitment. Add a deadline, share it with friends, set a group pause condition (e.g. pauses for everyone once 50% choose to pause). The social pressure is the feature.

**Friends** — the accountability layer. Add people you actually want to focus with. Shared challenges only work if the group is real.

**Ktags** — physical NFC tags that gate focus sessions on iOS. No software bypass. Tap to lock, tap the same tag to unlock.

**Gray Engine** — the content mediation layer. Given your goal and rules, it decides how to modify a webpage: hide distracting modules, blur low-value sections, highlight what matters. Predictable, explainable, reversible.

## Platforms

| Platform | Purpose |
|----------|---------|
| Browser extension | Applies Gray Engine rules to pages in real time |
| Web dashboard | Manage intents, challenges, friends, and rules |
| iOS app | NFC-gated focus sessions with native app blocking |
| API | Orchestrates classification, rules, and social state |

## Getting started

**Prerequisites:** Node.js, pnpm, a PostgreSQL database (we use [Neon](https://neon.tech)).

```bash
pnpm install
cp .env.example .env   # fill in values
pnpm db:migrate
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

## Scope (prototype)

In scope:
- Desktop browser extension (context-aware page modification)
- Web dashboard (intents, challenges, friends, rules)
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

For technical architecture and data models see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

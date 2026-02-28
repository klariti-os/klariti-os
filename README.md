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

## Scope (prototype)

This repo focuses on a working prototype that demonstrates **context-aware mediation** inside a desktop browser.

In scope:
- Desktop browser extension that observes and modifies page content
- Web dashboard for rules, profiles, and a global kill switch
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
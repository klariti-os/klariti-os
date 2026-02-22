# Klariti OS — Project Intent

> **Mission**: Reclaim human agency in the digital age by creating an intelligent intermediary between users and online platforms that prioritizes wellbeing over engagement.

---

## 1. Background & Problem Statement

Technology was originally designed to strengthen human connection, accelerate learning, and support personal growth. Over time, however, that vision has eroded. The internet, once a space for exploration and meaningful interaction, has evolved into **one of the most distracting environments ever created**.

### The Core Problem

- **Engagement-driven algorithms** now control much of our online experience
- These systems are engineered to **maximize attention** rather than promote wellbeing
- Users increasingly feel a **loss of agency** over their time, focus, and everyday habits
- Digital addiction has become a widespread public health concern

### Why Existing Solutions Fall Short

Most existing solutions in the productivity space rely on **rigid, binary logic**:

- Usage is framed as either "good" or "bad"
- Interventions are limited to **blocking** or **unrestricted access**
- They fail to recognize that online behavior is **rarely binary**
- The same platform may support learning in one moment and undermine focus in the next

---

## 2. Vision Statement

Klariti OS proposes a **new layer of the internet**: an intelligent intermediary positioned between the user and online platforms that **operates in the user's best interest**.

### Core Principles

| Principle               | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| **Wellbeing-First**     | Prioritize user health and intentionality over engagement metrics |
| **Context-Aware**       | Understand that content value exists along a spectrum             |
| **User Agency**         | Empower users to reclaim control without disconnecting entirely   |
| **Intelligent Shaping** | Filter, delay, reframe, or reroute content when appropriate       |

### The Gray Engine

The **Gray Engine** is the core decision system—a selective, context-aware engine designed **not to block the internet, but to shape it intelligently**.

Key capabilities:

- **Filtering** — Remove distracting elements from pages
- **Delaying** — Introduce friction for impulsive behavior
- **Reframing** — Present content in less addictive formats
- **Rerouting** — Redirect attention to more intentional alternatives

---

## 3. Project Manifesto

> _"We believe that technology should serve people, not exploit them. We reject addictive designs and data commodification. We prioritize transparency, privacy, and digital well-being. Our tools empower users to reclaim their time, align technology with human values, and live balanced, productive lives."_

### Anti-Zuckerberg Philosophy

This project explicitly stands against:

- Attention exploitation
- Dark patterns and manipulative UX
- Algorithmic content serving without user consent
- Data commodification for advertising

---

## 4. Technical Architecture

### Multi-Platform Approach

Klariti OS is designed as a **cross-platform ecosystem**:

```
klariti-OS/
├── extensions/          # Browser extensions
│   ├── chromium/        # Chrome, Edge, Brave, etc.
│   ├── firefox/         # Firefox-specific
│   ├── safari/          # Safari-specific
│   └── shared/          # Cross-extension utilities
│
├── mobile/              # Mobile applications
│   ├── android/
│   ├── ios/
│   └── shared/
│
├── desktop/             # Desktop applications
│   ├── electron/
│   ├── macos/
│   ├── windows/
│   └── linux/
│
├── backend/             # API & services
│   ├── api/             # REST/GraphQL endpoints
│   ├── database/        # Data persistence
│   └── auth/            # Authentication
│
└── web (klariti.so)     # Dashboard & landing
    ├── challenges/      # Community challenges
    ├── dashboard/       # User analytics
    └── manifesto/       # Project philosophy
```

### Current Implementation (klariti.so)

The web application currently includes:

| Feature               | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| **Challenges System** | Time-based and toggle challenges for building healthy habits |
| **Community Hub**     | Browse, join, and create challenges with others              |
| **Progress Tracking** | View personal challenge statistics                           |
| **Website Blocking**  | Configure distracting websites to block                      |
| **Authentication**    | User accounts with protected routes                          |

---

## 5. Technical Requirements

### Gray Engine Design Constraints

The decision system must:

1. **Operate on dynamic, partially observed data** — Web content is unpredictable
2. **Remain predictable and user-controlled** — No black-box decisions
3. **Act in real-time on live web pages** — Sub-second response requirements
4. **Balance automation with explicit user constraints** — Respect user preferences
5. **Be efficient, explainable, and reversible** — Transparent decision-making

### System Properties

| Property            | Requirement                                  |
| ------------------- | -------------------------------------------- |
| **Latency**         | < 100ms for content decisions                |
| **Privacy**         | All processing local by default              |
| **Explainability**  | User can understand why content was filtered |
| **Reversibility**   | One-click override for any decision          |
| **Configurability** | Fine-grained user control over rules         |

---

## 6. Value Proposition

### For Users

- **Reclaim time** — Reduce unintentional scrolling and distraction
- **Maintain focus** — Stay on task without complete disconnection
- **Build habits** — Use challenges to develop healthier digital behaviors
- **Understand patterns** — Analytics on personal digital consumption

### For Society

- **Research contribution** — Study brain activity linked to addictive platforms
- **Open alternative** — Provide tools outside the attention economy
- **Community building** — Connect users pursuing digital wellbeing

### Technical Innovation

- **Context-aware content moderation** — Beyond binary block/allow
- **Real-time content shaping** — Dynamic page modification
- **Explainable AI decisions** — Transparent reasoning for interventions

---

## 7. Current Priority

**Chromium Extension Development**

The immediate focus is building the browser extension that implements the Gray Engine for Chromium-based browsers (Chrome, Edge, Brave, Arc, etc.).

---

## 8. Research Foundation

The project includes conducting research on:

- Brain activity linked to interactions with specific digital platforms (e.g., Instagram)
- Patterns of addictive behavior in digital environments
- Effectiveness of different intervention strategies

Insights from this research will guide the design of effective solutions to counteract highly addictive algorithms.

---

## 9. Getting Started

### For Developers

```bash
# Clone the repository
git clone https://github.com/snwtr/klariti-os.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### For Contributors

1. Read the [Manifesto](/manifesto) to understand our philosophy
2. Join the [Discord server](https://discord.gg/NTKHD9pW)
3. Check the current priority (Chromium extension)
4. Fork, branch, and submit pull requests

---

## 10. Contact & Community

- **Discord**: [Join Server](https://discord.gg/NTKHD9pW)
- **Email**: klariti@googlegroups.com
- **License**: MIT

---

_This document serves as the canonical source of truth for what Klariti OS is, why it exists, and what it aims to achieve. Use it to onboard new contributors, guide AI model context, and maintain alignment across all development efforts._

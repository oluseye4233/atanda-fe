# The ARK Module — Mental Model & Endpoints

The ARK module (`src/modules/ark/`) is the **read-and-display surface** for the platform's core scoring system. It doesn't compute anything itself — it exposes HTTP endpoints that read the scoring state persisted by the **domain scoring engine** (`src/domain/scoring/`).

---

## The Big Picture

```
User activity (résumé upload, CCGE, verification, SPHINX)
        │
        ▼
  recalcArkForUser()          ← the ONLY writer of ARK identity
  (domain/scoring/recalc.ts)
        │
        ├── ark_identity        (one row per user: arkScore, jstIndex, ccmi, typology...)
        ├── ccmi_pillar_scores  (7 pillars + composite + tier)
        ├── lhcs_signals        (readiness: CPR / MPS / LCIS + traffic lights)
        └── ark_score_history   (append-only log of every change)
        │
        ▼
  ARK module (src/modules/ark/)  ← read-only, plus one manual recompute
        │
        ├── GET /v1/ark/identity
        ├── GET /v1/ark/lhcs
        ├── GET /v1/ark/history
        ├── GET /v1/ark/flywheel-cta
        ├── POST /v1/ark/recalc
        └── GET /v1/ark-score/stream  (SSE live updates)
```

The key principle: **the ARK module never writes score values directly.** It only reads from `ark_identity`, and the one write operation it exposes (`recalc`) goes through the single-writer `recalcArkForUser` pipeline.

---

## The Core Formula

### 1. JST Index (0–300)

```
JST = (Jobs×0.3 + Skills×0.4 + Talent×0.3) × 3
```

- **Jobs (30%)** — value of the user's current role in the labor market
- **Skills (40%)** — depth of verified skill coverage
- **Talent (30%)** — transferability to new roles

Sub-scores come from the **latest résumé assessment** (`assessments.jst_jobs`, `jst_skills`, `jst_talent`). A **SPHINX talent boost** is added on top: `published×2 + sold×1.5`.

### 2. CCMI (0–300)

Career Capital Maturity Index — a weighted sum of **7 pillars**, each 0–100:

| Pillar | Label | Weight |
|--------|-------|--------|
| P1 | System & Architecture | 18% |
| P2 | Role Clarity | 14% |
| P3 | Instruction Mastery | 18% |
| P4 | Example Curation | 12% |
| P5 | Constraint Discipline | 10% |
| P6 | Format Precision | 10% |
| P7 | Data Stewardship | 18% |

```
CCMI = (Σ pillar × weight) × 3, clamped to 0–300
```

Pillars are **derived from the résumé's 6 category scores** (`technical`, `leadership`, `analytical`, `communication`, `innovation`, `ai_adjacent`) plus a certification boost.

### 3. ARK Score (0–600)

```
ARK = JST + CCMI, clamped to 0–600
```

---

## The Derived Labels

| Output | Source | Meaning |
|--------|--------|---------|
| **ARK Tier** | ARK score band | Foundation (0–199) → Legendary (540–600) |
| **CCMI Tier** | CCMI band | T0 Unverified → T5 Master, each with a multiplier |
| **VMST Level** | ARK score | L0 Exposed → L4 Flourishing |
| **Typology** | Archetype scores | Architect (A) / Orchestrator (O) / Conductor (C) |
| **ARK ID** | All of the above | `ARK-<tier3>-<ccmiTier>-<typology>-<vmst>-<hash>` |
| **Resume Replacement %** | JST + automation risk | Estimated % of job AI could replace |
| **LHCS Status** | Weighted readiness | Healthy / Watch / At-Risk |

---

## The Endpoints

### `GET /v1/ark/identity`

Composes the full identity snapshot from three sources:
- `ark_identity` row (scores, labels, typology)
- `ccmi_pillar_scores` (the 7 pillars)
- latest assessment (JST sub-scores)

**Response:**
```json
{
  "arkScore": 123,
  "jstIndex": 45,
  "jstSub": { "jobs": 12, "skills": 18, "talent": 15 },
  "ccmi": 78,
  "ccmiTier": "T0",
  "ccmiPillars": { "P1": 20, "P2": 15, "P3": 25, "P4": 10, "P5": 12, "P6": 18, "P7": 30 },
  "arkTierKey": null,
  "vmstLevel": "L0",
  "typology": "A",
  "arkIdString": "ARK-FOU-T0-A-L0-abc123",
  "resumeReplacementPct": 35,
  "cprScore": 45,
  "mpsScore": 0,
  "lcisScore": 60,
  "lhcsStatus": "amber"
}
```

**Auth:** Session + `jstScore` plan module (admin/staff bypass).

---

### `GET /v1/ark/lhcs`

The **Long-Horizon Career Score** — three sub-signals:

| Signal | Weight | Measures |
|--------|--------|----------|
| **CPR** | 35% | Career Pivot Readiness — transferability to new domains |
| **MPS** | 35% | Monetization Potential Score — marketplace performance |
| **LCIS** | 30% | Learning Cycle Integrity Score — recency of learning activity |

Each signal is a traffic light (green ≥70, amber ≥40, red <40). The composite `status` is the band of the weighted average.

**Response:**
```json
{
  "cprScore": 45,
  "mpsScore": 0,
  "lcisScore": 60,
  "cprLight": "amber",
  "mpsLight": "red",
  "lcisLight": "amber",
  "status": "amber",
  "readinessPct": 39
}
```

---

### `GET /v1/ark/history?days=30`

Append-only history of every ARK score change.

**Response:**
```json
{
  "days": 30,
  "data": [
    { "arkScore": 123, "jstIndex": 45, "ccmi": 78, "delta": 15, "trigger": "ccge.session", "createdAt": "2026-08-01T00:00:00Z" }
  ]
}
```

`delta` is the applied change. `trigger` is what caused it (`ccge.session`, `card.verified`, `spc.sold`, etc.).

---

### `GET /v1/ark/flywheel-cta`

A **10-branch decision tree** that picks the best next action. Returns a single CTA:

```json
{
  "position": 3,
  "id": "drill_p1",
  "headline": "Strengthen P1 — your weakest CC pillar",
  "subtext": "Pillar P1 is at 20/100. A focused CCGE drill can lift your CCMI by 15-25 points.",
  "ctaLabel": "Run CCGE drill",
  "ctaHref": "/play",
  "pillar": "P1",
  "expectedDelta": 25,
  "urgency": "high"
}
```

---

### `POST /v1/ark/recalc`

Manually recomputes the user's identity. **Never awards positive ARK** — it's a sync/repair tool, not a cheat.

**Response:**
```json
{
  "arkScore": 123,
  "appliedDelta": 0,
  "rawDelta": 0,
  "capReason": "sync-no-positive"
}
```

---

### `GET /v1/ark-score/stream` (SSE)

Server-Sent Events stream for live score updates. Holds the connection open with 30-second heartbeats.

**Events:** `connected`, `ping`, and `event` (with updated identity on any score change).

---

## The Daily Caps

Only **positive deltas** are capped — downward changes always apply:

| Trigger | Cap | Window |
|---------|-----|--------|
| `ccge.session` | +15 | per 24h |
| `card.verified` | +40 | per 24h |
| SPHINX (creator) | +20 | per 30 days |
| `manual.recompute` / `backfill` | 0 (never positive) | — |

---

## The Single-Writer Principle

`recalcArkForUser()` is the **only place** that writes to `ark_identity`, `ccmi_pillar_scores`, `lhcs_signals`, and `ark_score_history`. Everything else — résumé upload, CCGE finish, verification submit, SPHINX purchase — just **emits an event** and lets the recalc pipeline route it.

---

## Files Involved

| File | Role |
|------|------|
| `src/modules/ark/routes.ts` | OpenAPI route definitions |
| `src/modules/ark/controllers.ts` | HTTP handlers + SSE stream |
| `src/modules/ark/handlers.ts` | `ArkService` — read-side composition |
| `src/modules/ark/schemas.ts` | Zod response shapes |
| `src/domain/scoring/engine.ts` | **Pure math** — JST/CCMI/ARK formulas, tiers, labels |
| `src/domain/scoring/ccmi.ts` | Pillar derivation from résumé categories |
| `src/domain/scoring/lhcs.ts` | LHCS pure math (traffic lights, composite) |
| `src/domain/scoring/recalc.ts` | **The single writer** — full recalc pipeline with caps |
| `src/domain/scoring/flywheel-cta.ts` | 10-branch CTA decision tree |
| `src/domain/scoring/repo.ts` | `ArkRepository` — DB access + persist transaction |
| `src/shared/constants/identity.ts` | Canonical weights, tier bands, labels (do NOT tune) |

---

## TL;DR

The ARK module is the **dashboard's window into the career score**. It reads a denormalized `ark_identity` snapshot (plus pillars, LHCS, and history) and exposes it over 6 endpoints, including a live SSE stream. The actual scoring math lives in the pure `domain/scoring/engine.ts`, and every change funnels through the single-writer `recalcArkForUser` pipeline, which enforces daily caps and logs every delta to history.

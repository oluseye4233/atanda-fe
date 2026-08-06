# Career Mobility / Talent Exchange — Frontend Integration Guide

**For:** The LLM or frontend developer integrating Career Mobility into the ARK Platform UI.
**Source:** Derived directly from route definitions, Zod schemas, middleware, and domain engine in `src/modules/matchmaking/` and `src/domain/matchmaking/`.

---

## 1. What Career Mobility is

Career Mobility (aka Talent Exchange) is the ARK feature that matches verified users to jobs and projects, and can assemble full project teams from candidate pools. It is the **Pro+ tier** feature described in the Go Live Manual, Phase 7.

The backend exposes **4 endpoints** under `/v1/matchmaking`. Every endpoint requires an authenticated session and the user's plan must include the `careerPathways` module (Pro, Architect, Schools, Institution — **not** Explorer).

---

## 2. Auth & Gating (in execution order)

Before building the UI, understand what gates a request:

| Layer | What it does | Error on failure |
|-------|-------------|-----------------|
| **Feature flag** (`matchmaking`) | If `FEATURE_MATCHMAKING=false`, all `/v1/matchmaking/*` routes return `404` as if they don't exist. | `404 { "error": "Not found" }` |
| **Rate limiting** (global) | 120 req / 60s per client. | `429` with `Retry-After` / `X-RateLimit-*` headers |
| **Session auth** | Requires a valid httpOnly session cookie OR `Authorization: Bearer <sessionId>` header. | `401 { "message": "Unauthenticated" }` |
| **Plan module gate** (`careerPathways`) | User must have an active subscription whose plan enables `careerPathways: true`. Admin/staff bypass. | `403 { "message": "An active subscription is required to access this feature" }` or `"Your plan does not include: careerPathways"` |

**Implication for the frontend:**
- If you get a `401`, redirect to login.
- If you get a `403`, show a plan-upgrade prompt (link to `/pricing` or the checkout flow).
- If you get a `404`, the feature is off — hide the Career Mobility section entirely.
- If you get a `429`, show a "too many requests" message and retry after `Retry-After` seconds.

---

## 3. Shared Types

These types recur across multiple endpoints. Define them once in your frontend code.

### Tier enum
```typescript
type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";
```

### OpportunityRequirement
```typescript
interface OpportunityRequirement {
  cardId: string;       // primitive card ID the role needs
  minTier: Tier;        // minimum verified tier required
  weight: number;       // ≥1, relative importance of this requirement
  roleLabel?: string;   // optional — groups requirements into a named role (e.g. "Backend", "Design")
}
```

### Opportunity object
```typescript
interface Opportunity {
  id: string;                  // uuid
  createdByUserId: string;     // uuid of the creator
  title: string;               // 1–255 chars
  description: string | null;
  jstFloor: number;            // int 0–300, minimum JST Index threshold
  archetypePreference: "A" | "O" | "C" | null;  // desired dominant archetype
  requirements: OpportunityRequirement[];        // ≥1
  createdAt: string;           // ISO 8601
}
```

### RequirementResult (inside match breakdown)
```typescript
interface RequirementResult {
  cardId: string;
  minTier: Tier;
  weight: number;
  userTier: Tier | null;       // null = user doesn't have this card at all
  status: "met" | "partial" | "missing";
  credit: number;              // 1 (met), 0.5 (partial — has card but tier too low), 0 (missing)
}
```

### MatchBreakdown
```typescript
interface MatchBreakdown {
  matchScore: number;           // 0–100, weighted: coverage(70%) + JST(20%) + archetype(10%)
  coveragePct: number;          // % of weighted requirements met (with partial credit)
  jstFactorPct: number;         // clamped JSTIndex / jstFloor as %
  archetypeFitPct: number;      // 100 (match) | 60 (mismatch or unknown candidate) | 100 (no preference)
  evidenceCount: number;        // how many of the requirements the user has any verified card for
  totalRequirements: number;    // total requirement count on the opportunity
  projectedMatchScore: number;  // what matchScore would be if coverage were 100%
  requirements: RequirementResult[];
}
```

### SkillGap
```typescript
interface SkillGap {
  cardId: string;
  minTier: Tier;
  userTier: Tier | null;
  kind: "missing" | "upgrade";  // "missing" = no verified card; "upgrade" = card exists but tier too low
}
```

### TeamAssignment
```typescript
interface TeamAssignment {
  roleLabel: string;         // the role name (from requirement.roleLabel, or "Core Team" if unlabeled)
  userId: string | null;     // uuid of assigned candidate, null if role unfilled
  coveragePct: number;       // % of that role's requirements the assigned candidate covers
}
```

### TeamResult
```typescript
interface TeamResult {
  txs: number;               // Team Excellence Score, 0–100
  skillCoveragePct: number;  // avg coverage across all roles
  diversityPct: number;      // archetype diversity score, 0–100
  jstDepthPct: number;       // avg JST depth of assigned candidates
  filledRoles: number;       // how many roles got a person
  totalRoles: number;        // total roles on the opportunity
  assignments: TeamAssignment[];
}
```

---

## 4. Endpoints

### 4.1 `POST /v1/matchmaking/opportunities` — Create an opportunity

Creates a new Talent Exchange opportunity (job posting / project).

**Method:** `POST`
**Path:** `/v1/matchmaking/opportunities`
**Auth:** Session required. Plan must include `careerPathways`.

#### Request body (JSON)
```json
{
  "title": "Senior Frontend Engineer",
  "description": "Build the next-gen ARK dashboard. Remote-friendly.",
  "jstFloor": 180,
  "archetypePreference": "A",
  "requirements": [
    {
      "cardId": "prim-react-001",
      "minTier": "Silver",
      "weight": 3,
      "roleLabel": "Frontend"
    },
    {
      "cardId": "prim-typescript-001",
      "minTier": "Gold",
      "weight": 2,
      "roleLabel": "Frontend"
    },
    {
      "cardId": "prim-system-design-001",
      "minTier": "Bronze",
      "weight": 1
    }
  ]
}
```

**Constraints:**
- `title`: required, 1–255 characters
- `description`: optional, nullable
- `jstFloor`: integer 0–300, defaults to 0 (no filter)
- `archetypePreference`: `"A"` | `"O"` | `"C"` | `null` — optional, nullable
- `requirements`: array, minimum 1 entry. Each entry:
  - `cardId`: non-empty string
  - `minTier`: `"Bronze"` | `"Silver"` | `"Gold"` | `"Platinum"`
  - `weight`: integer ≥1
  - `roleLabel`: optional string — groups requirements into named roles for team assembly

#### Responses

| Status | Body | When |
|--------|------|------|
| `201` | `Opportunity` object (see Section 3) | Created successfully |
| `401` | `{ "message": "Unauthenticated" }` | No valid session |
| `403` | `{ "message": "An active subscription is required..." }` or `"Your plan does not include: careerPathways"` | Plan gate failed |
| `422` | Zod validation error (Hono auto-format) | Body fails schema validation |
| `500` | `{ "message": "Database error while creating opportunity" }` | DB failure |

---

### 4.2 `GET /v1/matchmaking/opportunities` — List opportunities

Returns all opportunities, newest first, capped at 50.

**Method:** `GET`
**Path:** `/v1/matchmaking/opportunities`
**Auth:** Session required. Plan must include `careerPathways`.
**Query params:** None.

#### Responses

| Status | Body | When |
|--------|------|------|
| `200` | `{ "data": [ Opportunity, ... ] }` | Success (empty array if none exist) |
| `401` | `{ "message": "Unauthenticated" }` | No valid session |
| `403` | (same as 4.1) | Plan gate failed |
| `500` | `{ "message": "Database error while listing opportunities" }` | DB failure |

**Note:** This endpoint does NOT paginate — it returns up to 50 most recent opportunities in a single `data` array. If you need more, the server caps at 50.

---

### 4.3 `GET /v1/matchmaking/{id}` — Get opportunity + score current user

The core matching endpoint. Fetches a single opportunity by ID and scores the **current authenticated user** against it. This is the endpoint the UI calls when a user clicks into an opportunity to see their fit.

**Method:** `GET`
**Path:** `/v1/matchmaking/{id}`
**Auth:** Session required. Plan must include `careerPathways`.

#### URL params

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | The opportunity ID |

#### Response shape (200)
```json
{
  "opportunity": { /* Opportunity object */ },
  "placeable": false,
  "match": { /* MatchBreakdown */ } | null,
  "skillGap": [ /* SkillGap[] */ ]
}
```

**Key field: `placeable`**
- `true` → the current user has an assessment (archetype/JST) AND at least 1 verified card. The `match` object contains the full scoring breakdown.
- `false` → the user doesn't meet the minimum bar to be scored. `match` is `null`. `skillGap` is an empty array `[]`.

**When `placeable` is `false`**, the frontend should show a message like: "Complete your résumé analysis and earn at least one verified card to see your fit for this opportunity."

**The `match` object (when `placeable: true`):**
- `matchScore`: the overall 0–100 score. **This is the number to show prominently.** Bright green ≥80, green ≥60, amber ≥40, red <40.
- `coveragePct`: how much of the opportunity's weighted requirements the user meets.
- `jstFactorPct`: user's JST Index vs. the floor. 100% means the user meets or exceeds the floor.
- `archetypeFitPct`: 100 (preferred archetype match or no preference set) or 60 (mismatch).
- `evidenceCount` / `totalRequirements`: how many requirement cards the user has some evidence for.
- `projectedMatchScore`: the ceiling — what the matchScore would be if the user met 100% of requirements. Use this to show "upside potential."
- `requirements[]`: per-requirement breakdown. Frontend can render a checklist or progress bar:
  - `status: "met"` → green checkmark, user's tier meets/exceeds `minTier`
  - `status: "partial"` → amber warning, user has the card but below `minTier` (counts half)
  - `status: "missing"` → red X, user doesn't have this card verified at all

**The `skillGap` array:** Only includes non-met requirements. Use this to show the user what they need to work on:
- `kind: "missing"` → "You don't have [cardId] verified yet"
- `kind: "upgrade"` → "You have [cardId] at [userTier], but need [minTier]"

#### Responses

| Status | Body | When |
|--------|------|------|
| `200` | See above | Success |
| `401` | `{ "message": "Unauthenticated" }` | No valid session |
| `403` | (same as 4.1) | Plan gate failed |
| `404` | `{ "message": "Opportunity not found" }` | Bad or non-existent opportunity ID |
| `500` | `{ "message": "Database error while fetching opportunity" }` | DB failure |

---

### 4.4 `POST /v1/matchmaking/{id}/team` — Assemble a team

Given an opportunity and a list of candidate user IDs, greedily assembles the best team — one person per role. Used when a project lead or admin wants to staff an opportunity from a known pool.

**Method:** `POST`
**Path:** `/v1/matchmaking/{id}/team`
**Auth:** Session required. Plan must include `careerPathways`.

#### URL params

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | The opportunity ID |

#### Request body (JSON)
```json
{
  "candidateUserIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Constraints:**
- `candidateUserIds`: array of UUID strings, minimum 1, maximum 50.
- Candidates without an assessment or without any verified cards are silently excluded (they won't be assigned to roles).

#### Response shape (200)
```json
{
  "txs": 78,
  "skillCoveragePct": 82,
  "diversityPct": 67,
  "jstDepthPct": 74,
  "filledRoles": 3,
  "totalRoles": 4,
  "assignments": [
    { "roleLabel": "Frontend", "userId": "550e8400-...", "coveragePct": 90 },
    { "roleLabel": "Backend", "userId": "550e8400-...", "coveragePct": 75 },
    { "roleLabel": "Design", "userId": null, "coveragePct": 0 }
  ]
}
```

**Key field: `txs` (Team Excellence Score)**
- 0–100. Weighted blend of: skill coverage (60%) + archetype diversity (25%) + JST depth (15%).
- **Roles with no `roleLabel` on any requirement are grouped as `"Core Team"`.**

**Assignments with `userId: null`** mean that role could not be filled from the candidate pool. Show these as "Unfilled" in the UI.

#### Responses

| Status | Body | When |
|--------|------|------|
| `200` | TeamResult object (see Section 3) | Success — even if some roles are unfilled |
| `401` | `{ "message": "Unauthenticated" }` | No valid session |
| `403` | (same as 4.1) | Plan gate failed |
| `404` | `{ "message": "Opportunity not found" }` | Bad or non-existent opportunity ID |
| `422` | Zod validation error | Body fails schema validation (e.g. empty candidate list, >50 IDs) |
| `500` | `{ "message": "Database error while fetching opportunity" }` | DB failure |

---

## 5. Integration Flow — How the UI Should Work

### Screen: Opportunity Board (list view)
1. Call `GET /v1/matchmaking/opportunities` on mount.
2. Render each opportunity as a card showing: `title`, `jstFloor`, `archetypePreference` (as a badge: "A" / "O" / "C"), requirement count, creation date.
3. Tapping/clicking a card navigates to the detail view with `opportunity.id`.

### Screen: Opportunity Detail (scored for current user)
1. Call `GET /v1/matchmaking/{id}` on mount.
2. Show the opportunity metadata at the top (title, description, JST floor, archetype, requirements list).
3. **If `placeable: false`:** show an upsell message with a CTA to complete onboarding/résumé analysis.
4. **If `placeable: true`:**
   - Display `match.matchScore` prominently (large number, color-coded).
   - Show a progress bar for `coveragePct`.
   - Render each `requirement` as a row with card ID, min tier, current tier, and a status icon.
   - Render the `skillGap` list as "Skills to build" with CTA buttons linking to CCGE / verification for those card IDs.
   - Show `projectedMatchScore` as "Your potential: 92%".
5. If the user is the opportunity creator (check `opportunity.createdByUserId` against the current user), show a "Staff this opportunity" button.

### Screen: Team Assembly (for opportunity creators)
1. The creator picks candidate user IDs (from a search, a cohort, or manual entry).
2. Call `POST /v1/matchmaking/{id}/team` with `{ candidateUserIds: [...] }`.
3. Display the `txs` score prominently.
4. Render each assignment row:
   - Role name, assigned user name (look up from user IDs — the team endpoint doesn't return names, only user IDs), coverage %.
   - Unfilled roles (userId: null) with an "Invite" or "Expand pool" CTA.
5. Show aggregate stats: `skillCoveragePct`, `diversityPct`, `jstDepthPct`, `filledRoles/totalRoles`.

---

## 6. Error Handling Checklist

The frontend MUST handle every status code below and never show a raw error to the user.

| Status | UI action |
|--------|----------|
| `200` / `201` | Render data normally |
| `401` | Redirect to login, preserve return URL |
| `403` (plan) | Show upgrade modal: "Career Mobility requires a Pro plan or higher." Link to checkout. |
| `404` (feature flag) | Hide the Career Mobility navigation item entirely |
| `404` (opportunity) | Show "Opportunity not found" with a back button |
| `422` | Show validation error inline on the form field(s) |
| `429` | Show "Slow down! Please wait X seconds." Retry automatically after `Retry-After`. |
| `500` | Show "Something went wrong. Please try again." with a retry button. |

---

## 7. Key Gotchas

1. **placeable can be false even for Pro users.** A Pro user who hasn't uploaded a résumé and run an assessment (or hasn't earned any verified cards) is not placeable. The frontend must handle this gracefully — don't crash trying to read `match.matchScore` when `match` is `null`.

2. **The team endpoint doesn't return user names.** `assignments[].userId` is a UUID. You'll need to resolve names client-side — either batch-fetch from a user lookup endpoint, or maintain a local user map if you're operating within a cohort/enterprise context.

3. **Roles with no `roleLabel` are grouped as "Core Team".** When displaying team assignments, check for the string `"Core Team"` — that's the system-generated label, not one the opportunity creator chose.

4. **Opportunity list is capped at 50, no pagination.** If you need more than 50, this endpoint won't deliver it — flag it as a future need.

5. **Scoring weights are NOT configurable from the frontend.** Coverage is always 70%, JST 20%, archetype 10%. These are hardcoded in the domain engine (`engine.ts`).

6. **Unverified claims count at half weight.** The engine only scores verified cards. If a user has a card at Bronze but the requirement is Silver, it counts as "partial" (credit: 0.5). If they don't have the card at all, it's "missing" (credit: 0). This is the "half-weight for unverified" rule from the Go Live Manual.

7. **Feature flag status is available at `GET /v1/feature-flags`.** Call this on app boot to decide whether to show the Career Mobility nav item. Check for `"matchmaking": true`.

8. **Admin/staff bypass the plan gate.** An admin can access all matchmaking endpoints without an active Pro subscription. Your UI shouldn't show the upgrade prompt to admins — check the user's role from the `whoami` response.

---

## 8. Quick Reference — All Endpoints at a Glance

| Method | Path | Body | Response | Purpose |
|--------|------|------|----------|---------|
| `POST` | `/v1/matchmaking/opportunities` | `{ title, description?, jstFloor, archetypePreference?, requirements[] }` | `201` → Opportunity | Create a job/project posting |
| `GET` | `/v1/matchmaking/opportunities` | — | `200` → `{ data: Opportunity[] }` | Browse all opportunities (newest first, max 50) |
| `GET` | `/v1/matchmaking/{id}` | — | `200` → `{ opportunity, placeable, match?, skillGap[] }` | View opportunity + see your personal fit score |
| `POST` | `/v1/matchmaking/{id}/team` | `{ candidateUserIds: uuid[] }` | `200` → TeamResult | Assemble a team from a candidate pool |

---

## 9. Dependencies Checklist

Before integrating Career Mobility, ensure the following are already working in your frontend:

- [ ] **Auth flow complete** — login, session cookie persistence, `whoami` returning user role/plan.
- [ ] **Résumé analysis** — user can upload and receive an assessment (required to be "placeable").
- [ ] **CCGE / Verification** — user can earn verified cards (required for match scoring to produce non-zero results).
- [ ] **Plan display** — you can read the user's current plan from the subscription response to decide whether to show the upgrade prompt.
- [ ] **Feature flag check** — you call `/v1/feature-flags` on boot and conditionally render the Career Mobility navigation item.

# ARK Platform Backend — UI Integration Guide

This document is the frontend/UI integration reference for the **ARK Platform backend** (`arkbe`). It describes what the project is, the global request conventions, and every HTTP endpoint the server exposes — what each one expects, how it behaves, and what it returns.

Everything here is derived directly from the route definitions, Zod schemas, and middleware wiring in the codebase. Nothing is invented; where a behavior isn't implemented, it isn't listed.

---

## 1. What the project is

ARK is a **career-intelligence and AI-agent-certification platform**. The backend scores a user's career value (ARK Score) and their exposure to AI-driven job disruption, then powers the activities that raise that score: résumé analysis, a card game (CCGE), evidence-based verification quests, a Super Prompt Card marketplace (SPHINX), talent matchmaking, and a founding-member promo (F1000).

**Stack**
- **Runtime:** Bun
- **HTTP framework:** Hono (via `@hono/zod-openapi` — every route is OpenAPI-described)
- **Database:** PostgreSQL via Drizzle ORM
- **Cache / sessions / rate limiting:** Redis (ioredis)
- **AI providers:** Anthropic (primary), OpenAI, Gemini (optional fallbacks)
- **Payments:** Stripe

**Interactive API docs** are served by the running app:
- OpenAPI JSON: `GET /doc`
- Swagger UI: `GET /docs`

---

## 2. Global conventions

### Base path & versioning
Most endpoints live under `/v1`. A few operational routes live at the root (`/healthz`, `/doc`, `/docs`, `/v1/feature-flags`) and the multi-provider file analyzer at `/api/analyze`.

### Authentication
- Auth is **session-based**. On successful `login` (and after account verification), the server sets an **httpOnly session cookie**. Browser clients should send requests with credentials included (CORS is configured with `credentials: true`).
- Non-browser clients may instead send the session id as a **Bearer token**: `Authorization: Bearer <sessionId>`.
- Sessions use a **sliding expiration** — each authenticated request extends the session lifetime.
- Two short-lived flow cookies exist: `vsid` (account-verification session) and `rsid` (password-reset session). These are set/read automatically; the OTP flows read the session id from the cookie, not the request body.

**Public (no session required) endpoints:**
`POST /v1/auth/signup`, `POST /v1/auth/verify-account`, `POST /v1/auth/resend-code`, `POST /v1/auth/login`, `POST /v1/auth/request-reset`, `POST /v1/auth/verify-request-reset`, `POST /v1/auth/reset-password`, `GET /healthz`, `GET /doc`, `GET /docs`.

All other endpoints require a valid session (`401 Unauthenticated` otherwise).

### Authorization layers (in the order they run)
1. **Feature flags** — a route group whose flag is OFF returns a clean **`404`** (as if it doesn't exist). Flags are env-controlled (`FEATURE_<NAME>=true|false`).
2. **Rate limiting** (Redis-backed, fail-open) — over the limit returns **`429`** with `Retry-After` and `X-RateLimit-*` headers.
   - Global: **120 requests / 60s** per client.
   - `POST /v1/auth/*`: **20 / 60s**.
   - `POST /v1/f1000/claim`: **10 / 60s**.
3. **Session auth** — `401` if missing/invalid.
4. **Role gate** (`requireRole`) — admin/staff-only routes return **`403`** otherwise.
5. **Plan-module gate** (`requireModuleAccess`) — returns **`403`** unless the user's active subscription plan enables the required module. **`admin`/`staff` bypass this gate.**

### Content type
Request and response bodies are JSON (`application/json`), except two multipart file uploads: `POST /v1/resume/upload` and `POST /api/analyze` (`multipart/form-data`).

### Body-size limits
- Default: **1 MB**. Exceeding it returns **`413`**.
- `POST /v1/resume/upload` and `POST /api/analyze`: **20 MB**.

### Security headers
Helmet-equivalent secure headers + a Content-Security-Policy are applied to every response at boot.

### Error shape
Errors are returned as JSON. Most modules use:
```json
{ "message": "human-readable reason" }
```
A few newer endpoints (feature flags, F1000, the file analyzer) use:
```json
{ "error": "human-readable reason" }
```
(Each endpoint below notes which applies where it matters.)

### Pagination
List endpoints that paginate accept `page` and `pageSize` query params (defaults: page 1, size 20, max size 100) and return:
```json
{ "page": 1, "pageSize": 20, "total": 0, "data": [ ... ] }
```

### Dates
Date fields are serialized as JSON (ISO 8601 strings over the wire).

---

## 3. Auth — `/v1/auth`

Registration is a two-step flow: `signup` creates the account and emails a 6-digit code (and sets the `vsid` cookie); `verify-account` confirms it. Password reset mirrors this with the `rsid` cookie.

### POST `/v1/auth/signup` — public
Register a new account and send a verification code.
- **Body:** `{ name: string(1..255), email: string(email, ≤150), password: string }` — password must be ≥8 chars and include an uppercase, a lowercase, and a number.
- **201:** `{ message: string, expiresInSeconds: number }` (also sets the `vsid` cookie).
- **409:** email already registered. **422:** validation error.

### POST `/v1/auth/verify-account` — public (needs `vsid` cookie)
Verify the account with the emailed code.
- **Body:** `{ otp: string(6) }`
- **200:** `{ verified: boolean, message: string }`
- **401:** session expired / invalid code. **429:** too many attempts. **422:** validation error.

### POST `/v1/auth/resend-code` — public (needs `vsid` cookie)
Resend a fresh verification code.
- **Body:** none.
- **200:** `{ message: string, expiresInSeconds: number }` (refreshes the `vsid` cookie).
- **401:** session expired. **422:** validation error.

### POST `/v1/auth/login` — public
Authenticate and open a session.
- **Body:** `{ email: string(email, ≤150), password: string(8..255) }`
- **200:** the user object (see **User object** below); sets the session cookie.
- **401:** invalid credentials. **403:** account deactivated. **422:** validation error.

### POST `/v1/auth/logout` — authenticated
Destroy the current session.
- **Body:** none.
- **200:** `{ message: string }` (clears the session cookie). **401:** unauthenticated.

### GET `/v1/auth/whoami` — authenticated
- **200:** the current user object. **401:** unauthenticated.

### PATCH `/v1/auth/me` — authenticated
Update the current user's own name and/or email.
- **Body:** `{ name?: string(1..255), email?: string(email, ≤150) }` — at least one field required.
- **200:** the updated user object. **401:** unauthenticated. **409:** email already in use. **422:** validation error.

### POST `/v1/auth/request-reset` — public
Request a password reset code.
- **Body:** `{ email: string(email, ≤150) }`
- **201:** `{ message: string, expiresInSeconds: number }` (sets the `rsid` cookie).
- **400:** account does not exist. **422:** validation error.

### POST `/v1/auth/verify-request-reset` — public (needs `rsid` cookie)
- **Body:** `{ otp: string(6) }`
- **200:** `{ verified: boolean, message: string }`
- **401:** session expired / invalid code. **429:** too many attempts. **422:** validation error.

### POST `/v1/auth/reset-password` — public (needs `rsid` cookie)
- **Body:** `{ password: string }` — same complexity rule as signup.
- **200:** `{ message: string }` (clears the `rsid` cookie).
- **401:** session expired / invalid code. **429:** too many attempts. **422:** validation error.

**User object** (returned by login/whoami/me):
```json
{
  "id": "uuid", "email": "string", "name": "string",
  "type": "free | premium", "role": "user | admin | staff",
  "planId": "uuid | null", "stripeCustomerId": "string | null",
  "lastLogin": "date | null", "isActive": "boolean | null", "isVerified": "boolean | null",
  "createdAt": "date", "updatedAt": "date"
}
```

---

## 4. Users — `/v1/users` (admin/staff)

All user-management routes require the `admin` or `staff` role (create/update/delete are **admin-only**). `403` on insufficient role.

### GET `/v1/users` — admin/staff
List users (paginated).
- **Query:** `page?`, `pageSize?`, `search?` (name), `role?` (`user|admin|staff`), `type?` (`free|premium`).
- **200:** paginated `User object`s. **403:** access denied.

### GET `/v1/users/{id}` — admin/staff
- **Params:** `id` (uuid). **200:** user object. **403** / **404**.

### POST `/v1/users` — admin
- **Body:** `{ email, name(1..550), password(8..128), role?, type?, isActive?, isVerified?, planId? }`
- **201:** created user. **403** / **409** (email exists) / **422**.

### PATCH `/v1/users/{id}` — admin
- **Params:** `id`. **Body:** any subset of the create fields.
- **200:** updated user. **403** / **404** / **422**.

### DELETE `/v1/users/{id}` — admin
- **200:** `{ message: string }`. **403** / **404**.

### PATCH `/v1/users/{id}/deactivate` — admin/staff
- **200:** `{ message: string }`. **403** / **404**.

---

## 5. Plans — `/v1/plans`

`list` / `get` / `delete` are **admin/staff**. `create` / `update` require a session (no extra role gate).

### GET `/v1/plans` — admin/staff
- **Query:** `page?`, `pageSize?`, `search?`, `freeTrial?` (boolean). **200:** paginated plans. **403**.

### GET `/v1/plans/{id}` — admin/staff
- **200:** plan object. **403** / **404**.

### POST `/v1/plans` — authenticated
- **Body:** `{ title, freeTrial?, description?, features: string[], planRule, monthlyPrice: "9.99", yearlyPrice: "99.00", stripeMonthlyId?, stripeYearlyId? }`
  - `planRule` = `{ resumeUploads: "unlimited"|number, jstScore, fullDashboard, careerPathways, forgeCards, executiveReport, contextCraft, workforceIntel, institutionDashboard, prioritySupport }` (all booleans except `resumeUploads`).
  - Prices are decimal **strings** matching `^\d+(\.\d{1,2})?$`.
- **201:** plan object. **422**.

### PATCH `/v1/plans/{id}` — authenticated
- **Body:** any subset of the create fields. **200:** plan object. **404** / **422**.

### DELETE `/v1/plans/{id}` — admin/staff
- **200:** `{ message: string }`. **403** / **404**.

**Plan object:**
```json
{
  "id": "uuid", "title": "string", "freeTrial": true, "description": "string | null",
  "features": ["string"], "monthlyPrice": "string", "yearlyPrice": "string",
  "stripeMonthlyId": "string | null", "stripeYearlyId": "string | null",
  "createdAt": "date", "updatedAt": "date"
}
```

---

## 6. Payments — `/v1/payments`

### GET `/v1/payments/me` — authenticated
The current user's own payments (paginated).
- **Query:** `page?`, `pageSize?`, `status?` (`success|pending|failed|cancelled`).
- **200:** paginated payments. **401**.

### GET `/v1/payments` — admin/staff
- **Query:** `page?`, `pageSize?`, `userId?`, `status?`. **200:** paginated payments. **403**.

### GET `/v1/payments/{id}` — admin/staff
- **200:** payment object. **403** / **404**.

### POST `/v1/payments` — authenticated
- **Body:** `{ userId: uuid, amount: string, paymentSuccess?: "success|pending|failed|cancelled", paymentMeta?: any, payment_reference: string(1..255) }`
- **201:** payment object. **422**.

### PATCH `/v1/payments/{id}` — authenticated
- **Body:** `{ amount?, paymentSuccess?, paymentMeta? }`. **200:** payment object. **404** / **422**.

### DELETE `/v1/payments/{id}` — admin/staff
- **200:** `{ message: string }`. **403** / **404**.

**Payment object:**
```json
{
  "id": "uuid", "userId": "uuid", "amount": "string",
  "paymentSuccess": "success|pending|failed|cancelled | null",
  "paymentMeta": "any | null", "payment_reference": "string",
  "createdAt": "date", "updatedAt": "date"
}
```

---

## 7. Subscriptions — `/v1/subscriptions`

### GET `/v1/subscriptions/me` — authenticated
- **200:** the current user's subscription object. **401** / **404** (no subscription).

### GET `/v1/subscriptions` — admin/staff
- **Query:** `page?`, `pageSize?`, `userId?`, `planId?`, `status?` (`active|inactive`). **200:** paginated. **403**.

### GET `/v1/subscriptions/{id}` — admin/staff
- **200:** subscription object. **403** / **404**.

### POST `/v1/subscriptions` — authenticated
Start a Stripe Checkout for the current user. Records a pending payment and creates the user's single inactive subscription; it's activated by the Stripe webhook after payment succeeds. Send an `Idempotency-Key` header to make retries safe.
- **Body:** `{ planId: uuid, duration: "monthly" | "yearly" }`
- **201:** `{ checkoutUrl, checkoutSessionId, subscriptionId, paymentId, status, idempotentReplay: boolean }`
- **400:** plan not payable (missing Stripe price). **409:** already has an active subscription. **422:** validation error.

### PATCH `/v1/subscriptions/{id}` — authenticated
- **Body:** `{ planId?, status?, startDate?, endDate?, duration? }`. **200:** subscription object. **404** / **422**.

### DELETE `/v1/subscriptions/{id}` — admin/staff
- **200:** `{ message: string }`. **403** / **404**.

**Subscription object:**
```json
{
  "id": "uuid", "userId": "uuid", "planId": "uuid",
  "status": "active|inactive | null", "startDate": "date | null", "endDate": "date | null",
  "duration": "number | null", "createdAt": "date", "updatedAt": "date"
}
```

---

## 8. Resume counts — `/v1/resume-counts`

Tracks résumé-upload usage against the subscription's allowance.

### GET `/v1/resume-counts/me` — authenticated
- **200:** `{ id, user: { id, name }, subscription: { id, status }, total: number|null, count: number|null, createdAt, updatedAt }`. **404** if none.

### GET `/v1/resume-counts` — admin/staff
- **Query:** `page?`, `pageSize?`, `id?`, `userId?`, `search?`. **200:** paginated resume counts. **403**.

---

## 9. ARK identity & score — `/v1/ark`

**Feature flag:** `ark_score` (stream uses `ark_stream`). **Plan module:** `jstScore` (admin/staff bypass). All require a session.

### GET `/v1/ark/identity`
The current user's full ARK identity snapshot.
- **200:**
```json
{
  "arkScore": 0, "jstIndex": 0,
  "jstSub": { "jobs": 0, "skills": 0, "talent": 0 },
  "ccmi": 0, "ccmiTier": "string | null",
  "ccmiPillars": { "P1": 0, "P2": 0, "P3": 0, "P4": 0, "P5": 0, "P6": 0, "P7": 0 },
  "arkTierKey": "string | null", "vmstLevel": "string | null",
  "typology": "string | null", "arkIdString": "string | null",
  "resumeReplacementPct": 0,
  "cprScore": 0, "mpsScore": 0, "lcisScore": 0, "lhcsStatus": "string | null"
}
```
- **401:** unauthenticated.

### GET `/v1/ark/lhcs`
Long-Horizon Career Score readiness signal.
- **200:** `{ cprScore, mpsScore, lcisScore, cprLight: string|null, mpsLight: string|null, lcisLight: string|null, status: string|null, readinessPct: number }`. **401**.

### GET `/v1/ark/history`
ARK score history.
- **Query:** `days?` (positive int, max 365; default 30).
- **200:** `{ days: number, data: [ { arkScore, jstIndex, ccmi, delta, trigger, createdAt } ] }`. **401**.

### GET `/v1/ark/flywheel-cta`
The next best action to raise the score.
- **200:** `{ position: number, id: string, headline, subtext, ctaLabel, ctaHref, pillar?: string, expectedDelta: number, urgency: "critical"|"high"|"medium"|"low" }`. **401**.

### POST `/v1/ark/recalc`
Manually recompute ARK identity. Never awards positive ARK (recompute only).
- **Body:** none.
- **200:** `{ arkScore, appliedDelta, rawDelta, capReason: string|null }`. **401**.

### GET `/v1/ark-score/stream` — Server-Sent Events
**Feature flag:** `ark_stream`. Live identity stream over SSE. Auth is via the session cookie (so browser `EventSource` works).
- On connect the server emits an `event: connected` message, then pushes score-update events as they happen, with periodic `ping` heartbeats (~30s).
- Not a JSON request/response endpoint — open it with `EventSource('/v1/ark-score/stream', { withCredentials: true })`. **401** if unauthenticated.

---

## 10. Résumé analysis — `/v1/resume`, `/v1/assessments`

**Feature flags:** `resume_upload` (upload) and `resume_analysis` (assessments). Not plan-module gated (résumé analysis is available to the free tier; upload count is limited via resume-counts). All require a session.

### POST `/v1/resume/upload` — `multipart/form-data` (≤20 MB)
Upload a résumé file (PDF/DOCX/TXT), analyze it, archive the original to storage, and recompute ARK identity.
- **Form field:** `file` — the résumé file.
- **201:** `{ assessment, identity }` (see **Analyze response** below).
- **400:** no file under the `file` field. **401:** unauthenticated.

### POST `/v1/assessments`
Analyze pasted résumé text (no file) and recompute ARK identity.
- **Body:** `{ resumeText: string(1..200000) }`
- **201:** `{ assessment, identity }` (Analyze response). **401**.

### GET `/v1/assessments/user/{id}/latest`
Get a user's latest assessment. Allowed for self, or admin/staff.
- **Params:** `id` (uuid).
- **200:** an **Assessment object**. **401** / **403** (not self and not admin/staff).

### GET `/v1/assessments/user/{id}`
List a user's assessments (self or admin/staff).
- **200:** `{ data: [ Assessment object ] }`. **401** / **403**.

**Assessment object:**
```json
{
  "id": "uuid", "userId": "uuid",
  "jstTotal": 0, "jstJobs": 0, "jstSkills": 0, "jstTalent": 0,
  "vulnerabilityLevel": 0, "readinessProfile": "string",
  "riskModifiers": [ { "task": "string", "automatable": 0 } ],
  "matchedCardIds": ["string"],
  "archetypeArchitect": 0, "archetypeOrchestrator": 0, "archetypeConductor": 0,
  "contextCraftLevel": "string", "resumeUrl": "string | null", "createdAt": "date"
}
```

**Analyze response** (upload / paste):
```json
{
  "assessment": { /* Assessment object */ },
  "identity": {
    "arkScore": 0, "jstIndex": 0, "ccmi": 0, "ccmiTier": "string | null",
    "arkTierKey": "string | null", "vmstLevel": "string | null",
    "typology": "string | null", "arkIdString": "string | null", "appliedDelta": 0
  }
}
```

---

## 11. CCGE (Context Craft Game Engine) — `/v1/ccge`

**Feature flag:** `ccge`. **Plan module:** `forgeCards` (admin/staff bypass). All require a session.

### GET `/v1/ccge/cards`
List all cards.
- **200:** `{ data: [ { id, name, pillar, type, baseKcse, tokenCost, body: string|null } ] }`. **401**.

### GET `/v1/ccge/scenarios`
List scenarios, optionally filtered by tier.
- **Query:** `tier?` (string).
- **200:** `{ data: [ { id, tier, title, prompt, targetPillars: string[], tokenBudget, difficulty } ] }`. **401**.

### GET `/v1/ccge/sessions/{id}`
Get a session (owner only).
- **200:** a **Session object**. **401** / **403** / **404**.

### GET `/v1/ccge/sessions/user/{id}`
List a user's sessions (self or admin/staff).
- **200:** `{ data: [ Session object ] }`. **401** / **403**.

### POST `/v1/ccge/sessions`
Start a session — deals a 5-card hand for a scenario.
- **Body:** `{ scenarioId: uuid }`
- **201:** `{ sessionId: uuid, scenarioId: uuid, dealtCardIds: string[] }`. **401** / **404** (scenario not found).

### POST `/v1/ccge/sessions/{id}/finish`
Finish a session — score the played hand, optionally judge with Claude, apply the flywheel, and emit a capped ARK update.
- **Params:** `id` (session uuid).
- **Body:** `{ playedCardIds: string[](≥1), customCard?: { name: string, body: string }, useClaude?: boolean }`
- **200:**
```json
{
  "sessionId": "uuid", "kcseScore": 0, "tier": "string | null",
  "breakdown": {
    "knowledge": 0, "clarity": 0, "specificity": 0, "efficiency": 0,
    "pillarsCovered": ["string"], "synergies": [ { "name": "string", "multiplier": 0 } ],
    "tokenUsed": 0, "tokenBudget": 0, "base": 0, "final": 0
  },
  "flywheel": { "arkScoreDelta": 0, "certUpgradedFrom": "string|null", "certUpgradedTo": "string|null", "newJstSkills": "number|null", "newJstTotal": "number|null" },
  "judge": { "kcseDelta": 0, "narrative": "string", "strengths": ["string"], "weaknesses": ["string"] } | null,
  "appliedDelta": 0
}
```
- **401** / **403** / **404** / **409** (already finished).

**Session object:**
```json
{
  "id": "uuid", "userId": "uuid", "scenarioId": "uuid",
  "dealtCardIds": ["string"], "playedCardIds": ["string"] | null,
  "kcseScore": "number | null", "status": "string",
  "finishedAt": "date | null", "createdAt": "date"
}
```
> `useClaude` only takes effect for plans allowed to use it (the AI tier policy gates the Claude judge); otherwise `judge` is `null` and no adjustment is applied.

---

## 12. Verification quests — `/v1/verification`

**Feature flag:** `verification`. **Plan module:** `jstScore` (admin/staff bypass). All require a session.

### GET `/v1/verification/quest/{cardId}`
Get the verification quest (challenges) for a CODEC card.
- **Params:** `cardId` (string).
- **200:** `{ cardId, cardName, challenges: [ { standard: "onet"|"sfia"|"wef", cardId, cardName, skills: string[], targetPillars: string[], tokenBudget, instructions } ] }`.
- **401** / **404** (no quest for this card).

### POST `/v1/verification/submit`
Submit authored prompts to verify a card. Only cards on the user's own assessment can be verified.
- **Body:** `{ cardId: string, prompts: [ { standard: "onet"|"sfia"|"wef", prompt: string, dataPillarSatisfied?: boolean } ](≥1) }`
- **200:** `{ cardId, score: number, tier: string|null, prevTier: string|null, improved: boolean, crafts: number[], appliedDelta: number }`
- **401** / **403** (card not on your assessment) / **404** (no quest) / **422**.

---

## 13. AI features — `/v1/ai`, `/v1/admin/ai`

**Feature flags:** `ai_model_selection` (models + model-preference), `ai_narrative` (resume narrative), `ai_job_role_guide` (job-role guide), `ai_scenario_gen` (admin scenario generation). `GET /v1/ai/status` is not flag-gated. All require a session. AI entitlement is enforced by the **AI tier policy** (derived from the user's active plan title) plus token/cost budgets and per-kind daily quotas — not by `requireModuleAccess`.

### GET `/v1/ai/status`
Current user's AI usage/budget status.
- **200:**
```json
{
  "usage": { "tokens": 0, "costCents": 0 },
  "caps": { "tokens": 0, "costCents": 0 },
  "remaining": { "tokens": 0, "costCents": 0 },
  "ratioPct": 0, "upgradeAtPct": 0, "hardStopAtPct": 0, "guardrailActive": false
}
```
- **401**.

### GET `/v1/ai/models`
List selectable models and their availability (availability depends on which provider API keys are configured).
- **200:** `{ preferred: string|null, models: [ { id, provider, costTier, available: boolean } ] }`. **401**.

### PUT `/v1/ai/model-preference`
Set the current user's preferred model (or clear it with `null`).
- **Body:** `{ model: string | null }`
- **200:** `{ model: string | null }`. **401** / **422** (unknown model).

### POST `/v1/ai/resume-narrative/{assessmentId}`
Generate a Claude-narrated résumé summary for one of the user's own assessments (Pro+ per AI tier policy).
- **Params:** `assessmentId` (uuid).
- **200:** `{ summary: string, archetypeInsight: string, topRisks: string[], growthPath: string[], generatedAt: string, cached: boolean }`
- **401** / **402** (Pro tier required) / **403** (not your assessment) / **404** (assessment not found) / **502** (generation failed).

### POST `/v1/ai/job-role-guide`
Reference-only O*NET / SFIA / WEF guide for a job role (informational; not a score input). Globally cached.
- **Body:** `{ role: string(1..200) }`
- **200:** `{ role: string, onet: string[], sfia: string[], wef: { outlook: string, summary: string, signals: string[] }, cached: boolean }`
- **401** / **502** (generation failed — never returns a fabricated answer when the AI connection is unavailable).

### POST `/v1/admin/ai/generate-scenario` — admin/staff
Generate a custom CCGE scenario.
- **Body:** `{ brief: string, industry?: string, role?: string, tierHint?: "Bronze"|"Silver"|"Gold"|"Platinum" }`
- **200:** `{ tier: string, title: string, prompt: string, targetPillars: string[], tokenBudget: number, difficulty: number, industry?: string, isCustom: boolean }`
- **401** / **403** (access denied) / **502** (generation failed).

---

## 14. Matchmaking / Talent Exchange — `/v1/matchmaking`

**Feature flag:** `matchmaking`. **Plan module:** `careerPathways` (admin/staff bypass). All require a session.

### POST `/v1/matchmaking/opportunities`
Create a Talent Exchange opportunity.
- **Body:**
```json
{
  "title": "string(1..255)", "description": "string | null (optional)",
  "jstFloor": 0,                       // int 0..300, default 0
  "archetypePreference": "A|O|C | null (optional)",
  "requirements": [ { "cardId": "string", "minTier": "Bronze|Silver|Gold|Platinum", "weight": 1, "roleLabel": "string (optional)" } ]  // ≥1
}
```
- **201:** an **Opportunity object**. **401** / **422**.

### GET `/v1/matchmaking/opportunities`
- **200:** `{ data: [ Opportunity object ] }`. **401**.

### GET `/v1/matchmaking/{id}`
Get an opportunity and score the current user against it.
- **Params:** `id` (uuid).
- **200:**
```json
{
  "opportunity": { /* Opportunity object */ },
  "placeable": true,
  "match": {
    "matchScore": 0, "coveragePct": 0, "jstFactorPct": 0, "archetypeFitPct": 0,
    "evidenceCount": 0, "totalRequirements": 0, "projectedMatchScore": 0,
    "requirements": [ { "cardId": "string", "minTier": "Bronze|Silver|Gold|Platinum", "weight": 0, "userTier": "tier|null", "status": "met|partial|missing", "credit": 0 } ]
  } | null,
  "skillGap": [ { "cardId": "string", "minTier": "tier", "userTier": "tier|null", "kind": "missing|upgrade" } ]
}
```
- **401** / **404**.

### POST `/v1/matchmaking/{id}/team`
Assemble a team for an opportunity from a candidate pool.
- **Params:** `id` (uuid). **Body:** `{ candidateUserIds: uuid[] (1..50) }`
- **200:** `{ txs, skillCoveragePct, diversityPct, jstDepthPct, filledRoles, totalRoles, assignments: [ { roleLabel: string, userId: string|null, coveragePct: number } ] }`
- **401** / **404**.

**Opportunity object:**
```json
{
  "id": "uuid", "createdByUserId": "uuid", "title": "string", "description": "string | null",
  "jstFloor": 0, "archetypePreference": "string | null",
  "requirements": [ { "cardId": "string", "minTier": "tier", "weight": 1, "roleLabel": "string?" } ],
  "createdAt": "date"
}
```

---

## 15. SPHINX marketplace — `/v1/sphinx`

**Feature flag:** `sphinx_marketplace`. **Plan module:** `contextCraft` (admin/staff bypass). All require a session. Publishing is additionally gated by a `CC_400` certification level, a HIVE score ≥ 80, and price bounds; purchases split revenue 70/30 (creator/platform).

### POST `/v1/sphinx/hive-precheck`
Analyze a draft listing before publishing.
- **Body:** `{ title: string, body: string, pillar?: string | null }`
- **200:** an **Analysis object**. **401** / **402** (Pro tier required).

### POST `/v1/sphinx/listings`
Publish a Super Prompt Card.
- **Body:**
```json
{
  "title": "string(1..255)", "description": "string | null (optional)",
  "body": "string", "pillar": "string | null (optional)",
  "price": 0,                          // integer
  "hiveScore": 0,                      // int 0..100
  "kcseScore": 0,                      // int 0..50 (optional)
  "scope": "OPEN|CORPORATE|BOTH (optional)", "institution": "string | null (optional)"
}
```
- **201:** a **Listing object**. **401** / **403** (publish gate not met: cert / HIVE / price) / **422**.

### GET `/v1/sphinx/listings`
List active listings.
- **200:** `{ data: [ Listing object ] }`. **401**.

### POST `/v1/sphinx/listings/{id}/analyze`
Analyze an existing listing.
- **Params:** `id` (uuid). **200:** Analysis object. **401** / **402** / **404**.

### POST `/v1/sphinx/listings/{id}/purchase`
Purchase a listing (atomic; 70/30 split; you cannot buy your own).
- **Params:** `id` (uuid).
- **200:** `{ purchaseId: uuid, listingId: uuid, price: number, creatorShare: number, platformShare: number, isFirstSaleForCreator: boolean }`
- **401** / **404** / **409** (listing not active) / **422** (cannot buy own listing).

**Analysis object** (hive-precheck / analyze):
```json
{ "letterGrade": "string", "letterGradeColor": "string", "hiveScore": 0,
  "pillarSuggestions": [ { "pillar": "string", "suggestion": "string" } ],
  "generatedAt": "string", "cached": false }
```

**Listing object:**
```json
{
  "id": "uuid", "creatorUserId": "uuid", "title": "string", "description": "string | null",
  "body": "string", "pillar": "string | null", "hiveScore": 0, "kcseScore": 0, "price": 0,
  "status": "string", "scope": "string", "institution": "string | null", "createdAt": "date"
}
```

---

## 16. F1000 founding-member promo — `/v1/f1000`

**Feature flag:** `f1000_promo`. Requires a session. `POST /v1/f1000/claim` has its own **10-per-minute** rate limiter. Uses the `{ "error": "..." }` envelope. The code pool is hard-capped at 1000 and each account may hold only one code; re-claiming your own code is idempotent.

### GET `/v1/f1000/stats`
Live founding-member counter.
- **200:** `{ total: number, claimed: number, remaining: number }`.

### POST `/v1/f1000/claim`
Claim a founding-member code.
- **Body:** `{ code: string(≥4) }` (the token from the QR).
- **200:** `{ code: string, seq: number, alreadyClaimed: boolean, member: true }` — `alreadyClaimed` is `true` when this account already owned this exact code (idempotent replay).
- **401:** unauthenticated. **404:** invalid code. **409:** already claimed by someone else, or this account already holds a code. **410:** pool sold out. **422:** validation error. **429:** over the 10/min limit.

---

## 17. Multi-provider file analysis — `/api/analyze`

**Feature flag:** `file_analysis`. Requires a session. `multipart/form-data`, up to 20 MB. Uses the `{ "error": "..." }` envelope. Sends uploaded files to a chosen LLM provider for analysis.

### POST `/api/analyze` — `multipart/form-data`
- **Form fields:**
  - `files` — one or more files (repeat the field for multiple).
  - `prompt` — optional; defaults to `"Summarize these files."`.
  - `provider` — optional; one of `anthropic | openai | gemini`; defaults to the first configured provider.
- **200:** `{ provider: string, model: string, answer: string, ingestionErrors: string[] }`
- **400:** unknown provider, or no files provided.
- **422:** all files failed to ingest.
- **503:** no LLM provider configured / provider error.
- **500:** internal error.

---

## 18. Operational endpoints

### GET `/healthz` — public
Liveness probe.
- **200:** `{ "status": "ok" }`.

### GET `/v1/feature-flags` — authenticated
Snapshot of every feature flag's current on/off state (lets the UI decide which surfaces to render).
- **200:** an object mapping each flag name to a boolean, e.g. `{ "ark_score": true, "ccge": true, "f1000_promo": true, "enterprise_intelligence": false, ... }`.

### GET `/doc` — public
OpenAPI 3.0 document (JSON) describing all documented routes.

### GET `/docs` — public
Swagger UI, backed by `/doc`.

---

## 19. Feature flags reference

Every gated route group checks a flag; when OFF the route returns a clean `404`. Flags are set via env vars `FEATURE_<UPPER_SNAKE>=true|false`.

**Live by default (intelligence core):** `ark_score`, `ark_stream`, `resume_analysis`, `resume_upload`, `ccge`, `verification`, `ai_narrative`, `ai_job_role_guide`, `ai_scenario_gen`, `ai_model_selection`, `matchmaking`, `sphinx_marketplace`, `file_analysis`, `f1000_promo`.

**Off by default (not yet built / opt-in):** `revenue_guardrail`, `enterprise_intelligence`, `ark_report`, `ark_resume`, `ats_score`, `compass`, `training_provider_funnel`, `gdpr_data_rights`, `cohorts`, `book_companion`.

> `GET /v1/feature-flags` returns the authoritative live state — the UI should read it rather than hardcoding this list.

---

## 20. Plan-module gating summary

`requireModuleAccess` maps route groups to `PlanRule` booleans. A non-admin/staff user needs an **active** subscription whose plan enables the module, or the route returns `403`. `admin` and `staff` bypass this check entirely.

| Route group | Required plan module |
|---|---|
| `/v1/ark/*` | `jstScore` |
| `/v1/ccge/*` | `forgeCards` |
| `/v1/verification/*` | `jstScore` |
| `/v1/matchmaking/*` | `careerPathways` |
| `/v1/sphinx/*` | `contextCraft` |

Résumé analysis/upload, AI routes, and F1000 are **not** gated by `requireModuleAccess` (AI uses its own tier policy; résumé upload is limited via resume-counts; F1000 is open to any signed-in user under the feature flag).

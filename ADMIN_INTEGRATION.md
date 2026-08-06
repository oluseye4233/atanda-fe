# COMMAND CENTER — Admin Frontend Integration Guide

**For:** The LLM building the admin dashboard ("COMMAND CENTER") for the ARK Platform.
**Source:** Extracted from every route, schema, controller, and middleware in `src/modules/`, `src/dependencies/`, and `src/llm/`.

The COMMAND CENTER already has a middleware that handles API calls to the backend in api.ts This document describes every endpoint an admin needs, organized by domain, with exact request shapes, query filters, response shapes, and error codes.

---

## 1. Auth & Role Model

### Roles
| Role | What it can do |
|------|---------------|
| `admin` | Everything. Create/edit/delete users, plans, payments, subscriptions. Access all admin endpoints. |
| `staff` | Most things. List/view users, payments, subscriptions, plans, resume counts. Deactivate users. Cannot create/delete users. Cannot delete plans. |
| `user` | Nothing admin-gated. Only self-access endpoints. |

### Session
- Cookie-based auth (httpOnly session cookie) OR `Authorization: Bearer <sessionId>` header.
- All admin endpoints require a valid session. `401` if missing.
- Admin endpoints additionally require `role: "admin"` or `role: "admin" | "staff"`. `403 { "message": "Access Denied!" }` if the role is insufficient.

### Check your role
Call `GET /v1/auth/whoami` on boot. The response includes `role`:
```json
{ "id": "uuid", "email": "...", "name": "...", "role": "admin|staff|user", ... }
```
If `role` is not `"admin"` or `"staff"`, hide every admin-only surface.

---

## 2. Global Conventions

### Base URL
All endpoints are prefixed with `/v1` (except `/healthz`, `/doc`, `/docs`, `/api/analyze`).

### Pagination
All list endpoints use the same pagination contract:
```
GET /v1/...?page=1&pageSize=20
```
Response shape:
```json
{ "page": 1, "pageSize": 20, "total": 142, "data": [ ... ] }
```
- `page`: defaults to 1, 1-based.
- `pageSize`: defaults to 20, max 100.
- `total`: total matching records (for pagination UI).

### Dates
All date fields are ISO 8601 strings.

### Error shape
Most endpoints return:
```json
{ "message": "human-readable reason" }
```
F1000 and feature-flag endpoints use `{ "error": "..." }`.

### Rate limiting
- Global: 120 req / 60s per client. `429` with `Retry-After` and `X-RateLimit-*` headers.
- Auth endpoints: 20 / 60s.
- F1000 claim: 10 / 60s.

### Feature flags
Always call `GET /v1/feature-flags` on boot to know which surfaces are enabled. When a flag is OFF, its routes return `404`.

### Content type
JSON for everything except:
- `POST /v1/resume/upload`: `multipart/form-data` (≤20 MB)
- `POST /api/analyze`: `multipart/form-data` (≤20 MB)

Default body limit: 1 MB. Returns `413` if exceeded.

---

## 3. Users — `/v1/users`

All user-management endpoints. The list/get/deactivate endpoints allow `admin` or `staff`. Create/update/delete allow `admin` only.

### User object
```typescript
interface User {
  id: string;                    // uuid
  email: string;                 // email
  name: string;
  type: "free" | "premium";
  role: "user" | "admin" | "staff";
  isActive: boolean;
  isVerified: boolean;
  planId: string | null;         // uuid of assigned plan, or null
  stripeCustomerId: string | null;
  lastLogin: string | null;      // ISO 8601
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

---

### `GET /v1/users` — List users

**Role:** `admin` | `staff`
**Pagination:** Yes

#### Query params (all optional)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | 1-based, default 1 |
| `pageSize` | number | default 20, max 100 |
| `search` | string | Searches across name AND email (partial match) |
| `role` | `"user"` \| `"admin"` \| `"staff"` | Filter by role |
| `type` | `"free"` \| `"premium"` | Filter by account type |

**Filters are AND-combined.** e.g. `?search=john&role=user` returns users whose name/email contains "john" AND who have role "user".

#### Response
```json
{
  "page": 1,
  "pageSize": 20,
  "total": 142,
  "data": [ /* User[] */ ]
}
```

#### Status codes
| Status | Meaning |
|--------|---------|
| `200` | Success |
| `403` | Access denied (not admin/staff) |

---

### `GET /v1/users/{id}` — Get a single user

**Role:** `admin` | `staff`

#### URL params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | User ID |

#### Response (200)
A single `User` object.

#### Status codes
| Status | Meaning |
|--------|---------|
| `200` | Success |
| `403` | Access denied |
| `404` | User not found |

---

### `POST /v1/users` — Create a user

**Role:** `admin` only

#### Request body
```json
{
  "email": "user@example.com",        // required, valid email
  "name": "Jane Doe",                  // required, 1–550 chars
  "password": "securePass123",         // required, 8–128 chars
  "role": "user",                      // optional, default "user"
  "type": "premium",                   // optional, default "free"
  "isActive": true,                    // optional, default true
  "isVerified": false,                 // optional, default false
  "planId": "uuid-or-null"             // optional, default null
}
```

#### Response (201)
The created `User` object (password excluded).

#### Status codes
| Status | Meaning |
|--------|---------|
| `201` | Created |
| `403` | Access denied (not admin) |
| `409` | Email already exists |
| `422` | Validation error |

---

### `PATCH /v1/users/{id}` — Update a user

**Role:** `admin` only

#### URL params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | User ID |

#### Request body (all fields optional)
```json
{
  "email": "new@example.com",    // optional
  "name": "New Name",            // optional, 1–550
  "password": "newPass456",      // optional, 8–128 (will be hashed server-side)
  "role": "staff",               // optional
  "type": "premium",             // optional
  "isActive": false,             // optional
  "isVerified": true,            // optional
  "planId": "uuid-or-null"       // optional
}
```

#### Response (200)
The updated `User` object.

#### Status codes
| Status | Meaning |
|--------|---------|
| `200` | Updated |
| `403` | Access denied (not admin) |
| `404` | User not found |
| `422` | Validation error |

---

### `DELETE /v1/users/{id}` — Delete a user

**Role:** `admin` only

#### URL params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | User ID |

#### Response (200)
```json
{ "message": "User deleted" }
```

#### Status codes
| Status | Meaning |
|--------|---------|
| `200` | Deleted |
| `403` | Access denied (not admin) |
| `404` | User not found |

---

### `PATCH /v1/users/{id}/deactivate` — Deactivate a user

**Role:** `admin` | `staff`

Sets `isActive: false` and `isVerified: false` on the user. Safer than deletion — the user can be reactivated later via `PATCH /v1/users/{id}`.

#### URL params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | User ID |

#### Response (200)
```json
{ "message": "User deactivated" }
```

#### Status codes
| Status | Meaning |
|--------|---------|
| `200` | Deactivated |
| `403` | Access denied |
| `404` | User not found |

---

## 4. Plans — `/v1/plans`

### Plan object
```typescript
interface Plan {
  id: string;                           // uuid
  title: string;                        // e.g. "Explorer", "Pro"
  freeTrial: boolean;
  description: string | null;
  features: string[];                   // bullet-point list for display
  monthlyPrice: string;                 // decimal string, e.g. "29.99"
  yearlyPrice: string;                  // decimal string, e.g. "299.00"
  stripeMonthlyId: string | null;       // Stripe price ID
  stripeYearlyId: string | null;        // Stripe price ID
  createdAt: string;
  updatedAt: string;
}
```

**Note:** The admin list/get endpoints return the full Plan object (including `stripeMonthlyId` and `stripeYearlyId`). The public endpoint `GET /v1/plans/public` strips those two fields.

### PlanRule (embedded in create/update, NOT in the Plan object response)
```typescript
interface PlanRule {
  resumeUploads: "unlimited" | number;  // upload quota
  jstScore: boolean;                    // ARK Score access
  fullDashboard: boolean;               // dashboard access
  careerPathways: boolean;              // Career Mobility
  forgeCards: boolean;                  // CCGE card game
  executiveReport: boolean;             // ARK REPORT
  contextCraft: boolean;                // SPHINX marketplace
  workforceIntel: boolean;              // Enterprise intelligence
  institutionDashboard: boolean;        // Institution dashboard
  prioritySupport: boolean;             // Priority support
}
```

---

### `GET /v1/plans` — List plans

**Role:** `admin` | `staff`
**Pagination:** Yes

#### Query params (all optional)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | 1-based, default 1 |
| `pageSize` | number | default 20, max 100 |
| `search` | string | Searches plan `title` |
| `freeTrial` | boolean | Filter by free trial flag (`true` or `false`) |

#### Response
Standard paginated response with `Plan[]` in `data`.

#### Status codes
| Status | Meaning |
|--------|---------|
| `200` | Success |
| `403` | Access denied |

---

### `GET /v1/plans/{id}` — Get a single plan

**Role:** `admin` | `staff`

#### URL params: `id` (uuid)

#### Response (200)
A single `Plan` object.

#### Status codes: `200` / `403` / `404`

---

### `POST /v1/plans` — Create a plan

**Auth:** Session required (any authenticated user can create plans — plan deletion is admin/staff gated).

#### Request body
```json
{
  "title": "Enterprise",                // required, 1–255
  "freeTrial": false,                   // optional, default false
  "description": "For large orgs",      // optional, nullable
  "features": ["Feature 1", "..."],     // required, string[]
  "planRule": {                         // required
    "resumeUploads": 50,
    "jstScore": true,
    "fullDashboard": true,
    "careerPathways": true,
    "forgeCards": true,
    "executiveReport": true,
    "contextCraft": true,
    "workforceIntel": true,
    "institutionDashboard": true,
    "prioritySupport": true
  },
  "monthlyPrice": "99.99",              // required, decimal regex
  "yearlyPrice": "999.00",              // required, decimal regex
  "stripeMonthlyId": "price_xxx",       // optional, nullable
  "stripeYearlyId": "price_yyy"         // optional, nullable
}
```

#### Response (201)
The created `Plan` object.

#### Status codes: `201` / `422`

---

### `PATCH /v1/plans/{id}` — Update a plan

**Auth:** Session required.

#### URL params: `id` (uuid)
#### Body: same shape as create, but all fields optional (partial update).

#### Response (200): Updated `Plan` object.
#### Status codes: `200` / `404` / `422`

---

### `DELETE /v1/plans/{id}` — Delete a plan

**Role:** `admin` | `staff`

#### URL params: `id` (uuid)
#### Response (200): `{ "message": "Plan deleted" }`
#### Status codes: `200` / `403` / `404`

---

### `GET /v1/plans/public` — List plans (no auth)

**Public.** No role required. No session required.

Returns: `Plan[]` (but with `stripeMonthlyId` and `stripeYearlyId` excluded — only `id`, `title`, `freeTrial`, `description`, `features`, `monthlyPrice`, `yearlyPrice`, `createdAt`, `updatedAt`).

Use this for the pricing page or plan selector when the user isn't logged in.

**Status codes:** `200` only.

---

## 5. Payments — `/v1/payments`

### Payment object
```typescript
interface Payment {
  id: string;                                    // uuid
  userId: string;                                // uuid
  amount: string;                                // decimal string
  paymentSuccess: "success" | "pending" | "failed" | "cancelled" | null;
  paymentMeta: unknown | null;                   // arbitrary JSON (Stripe metadata, idempotency keys, etc.)
  payment_reference: string;                     // Stripe checkout session ID
  createdAt: string;
  updatedAt: string;
}
```

---

### `GET /v1/payments` — List all payments

**Role:** `admin` | `staff`
**Pagination:** Yes

#### Query params (all optional)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | 1-based, default 1 |
| `pageSize` | number | default 20, max 100 |
| `userId` | uuid | Filter by user |
| `status` | `"success"` \| `"pending"` \| `"failed"` \| `"cancelled"` | Filter by payment status |

#### Response
Standard paginated response with `Payment[]` in `data`.

#### Status codes: `200` / `403`

---

### `GET /v1/payments/me` — My payments

**Auth:** Any authenticated user. Returns only the current user's payments.

#### Query params

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | 1-based, default 1 |
| `pageSize` | number | default 20, max 100 |
| `status` | `"success"` \| `"pending"` \| `"failed"` \| `"cancelled"` | Filter by status |

#### Status codes: `200` / `401`

---

### `GET /v1/payments/{id}` — Get a single payment

**Role:** `admin` | `staff`

#### URL params: `id` (uuid)
#### Response (200): A single `Payment` object.
#### Status codes: `200` / `403` / `404`

---

### `POST /v1/payments` — Record a payment

**Auth:** Any authenticated user.

#### Request body
```json
{
  "userId": "uuid",                    // required
  "amount": "29.99",                   // required, string
  "paymentSuccess": "success",         // optional
  "paymentMeta": { "key": "value" },   // optional, arbitrary JSON
  "payment_reference": "ref-123"       // required, 1–255
}
```

#### Response (201): The created `Payment` object.
#### Status codes: `201` / `422`

---

### `PATCH /v1/payments/{id}` — Update a payment

**Auth:** Any authenticated user.

#### URL params: `id` (uuid)
#### Body (all optional):
```json
{
  "amount": "39.99",
  "paymentSuccess": "success",
  "paymentMeta": {}
}
```

#### Response (200): Updated `Payment` object.
#### Status codes: `200` / `404` / `422`

---

### `DELETE /v1/payments/{id}` — Delete a payment

**Role:** `admin` | `staff`

#### URL params: `id` (uuid)
#### Response (200): `{ "message": "Payment deleted" }`
#### Status codes: `200` / `403` / `404`

---

## 6. Subscriptions — `/v1/subscriptions`

### Subscription object
```typescript
interface Subscription {
  id: string;                    // uuid
  userId: string;                // uuid
  planId: string;                // uuid of the plan
  status: "active" | "inactive" | null;
  startDate: string | null;      // ISO 8601
  endDate: string | null;        // ISO 8601
  duration: number | null;       // days (30 or 365)
  createdAt: string;
  updatedAt: string;
}
```

---

### `GET /v1/subscriptions` — List all subscriptions

**Role:** `admin` | `staff`
**Pagination:** Yes

#### Query params (all optional)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | 1-based, default 1 |
| `pageSize` | number | default 20, max 100 |
| `userId` | uuid | Filter by user |
| `planId` | uuid | Filter by plan |
| `status` | `"active"` \| `"inactive"` | Filter by status |

#### Response
Standard paginated response with `Subscription[]` in `data`.

#### Status codes: `200` / `403`

---

### `GET /v1/subscriptions/me` — My subscription

**Auth:** Any authenticated user.

Returns the current user's single subscription (or `404` if they have none).

#### Status codes: `200` / `401` / `404`

---

### `GET /v1/subscriptions/{id}` — Get a single subscription

**Role:** `admin` | `staff`

#### URL params: `id` (uuid)
#### Response (200): A single `Subscription` object.
#### Status codes: `200` / `403` / `404`

---

### `POST /v1/subscriptions` — Start a checkout

**Auth:** Any authenticated user.

Opens a Stripe Checkout session. This is the main purchase flow. Send an `Idempotency-Key` header to make retries safe.

#### Request body
```json
{
  "planId": "uuid",         // required
  "duration": "monthly"     // "monthly" | "yearly"
}
```

#### Response (201)
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "checkoutSessionId": "cs_...",
  "subscriptionId": "uuid",
  "paymentId": "uuid",
  "status": "pending",
  "idempotentReplay": false
}
```

**Key behavior:**
- The subscription is created `inactive` and the payment `pending`.
- Only the Stripe webhook activates them after payment succeeds.
- If `idempotentReplay` is `true`, this is a replay of a prior checkout — don't redirect the user to a new Stripe page, just show the existing one.
- For free plans (amount = 0), the subscription is activated immediately without Stripe.

#### Status codes: `201` / `400` (missing Stripe price) / `409` (already active) / `422`

---

### `PATCH /v1/subscriptions/{id}` — Update a subscription

**Auth:** Any authenticated user.

#### URL params: `id` (uuid)
#### Body (all optional):
```json
{
  "planId": "uuid",
  "status": "active",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-02-01T00:00:00Z",
  "duration": 30
}
```

#### Response (200): Updated `Subscription` object.
#### Status codes: `200` / `404` / `422`

---

### `DELETE /v1/subscriptions/{id}` — Delete a subscription

**Role:** `admin` | `staff`

#### URL params: `id` (uuid)
#### Response (200): `{ "message": "Subscription deleted" }`
#### Status codes: `200` / `403` / `404`

---

## 7. Resume Counts — `/v1/resume-counts`

### ResumeCount object
```typescript
interface ResumeCount {
  id: string;                           // uuid
  user: {
    id: string;                         // uuid
    name: string;
  };
  subscription: {
    id: string;                         // uuid
    status: string | null;
  };
  total: number | null;                 // total uploads allowed (from plan rule)
  count: number | null;                 // uploads used so far
  createdAt: string;
  updatedAt: string;
}
```

---

### `GET /v1/resume-counts` — List all resume counts

**Role:** `admin` | `staff`
**Pagination:** Yes

#### Query params (all optional)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | 1-based, default 1 |
| `pageSize` | number | default 20, max 100 |
| `id` | uuid | Filter by resume-count record ID |
| `userId` | uuid | Filter by user ID |
| `search` | string | Searches user name |

#### Response
Standard paginated response with `ResumeCount[]` in `data`.

#### Status codes: `200` / `403`

---

### `GET /v1/resume-counts/me` — My resume count

**Auth:** Any authenticated user.

Lazy-creates the record if it doesn't exist yet.

#### Status codes: `200` / `404` (no active subscription)

---

## 8. Assessments (Résumé Analysis) — `/v1/assessments`, `/v1/resume`

### Assessment object
```typescript
interface Assessment {
  id: string;                            // uuid
  userId: string;                        // uuid
  jstTotal: number;
  jstJobs: number;
  jstSkills: number;
  jstTalent: number;
  vulnerabilityLevel: number;           // 0–4 automation vulnerability
  readinessProfile: string;
  riskModifiers: { task: string; automatable: number }[];
  matchedCardIds: string[];
  archetypeArchitect: number;
  archetypeOrchestrator: number;
  archetypeConductor: number;
  contextCraftLevel: string;
  resumeUrl: string | null;
  createdAt: string;
}
```

---

### `GET /v1/assessments/user/{id}/latest` — Get latest assessment

**Auth:** Self OR `admin` | `staff`

#### URL params: `id` (uuid) — the target user's ID

If the requesting user's ID matches `id`, access is granted. Otherwise, their role must be `admin` or `staff`.

#### Response (200): A single `Assessment` object.
#### Status codes: `200` / `401` / `403` / `404`

---

### `GET /v1/assessments/user/{id}` — List all assessments for a user

**Auth:** Self OR `admin` | `staff`

#### URL params: `id` (uuid) — the target user's ID

#### Response (200): `{ "data": [ Assessment, ... ] }`
#### Status codes: `200` / `401` / `403`

---

### `POST /v1/assessments` — Analyze pasted resume text

**Auth:** Any authenticated user.

#### Request body
```json
{
  "resumeText": "Paste full resume text here..."   // required, 1–200,000 chars
}
```

#### Response (201)
```json
{
  "assessment": { /* Assessment object */ },
  "identity": {
    "arkScore": 123,
    "jstIndex": 45,
    "ccmi": 78,
    "ccmiTier": "Silver",
    "arkTierKey": "S3",
    "vmstLevel": "3",
    "typology": "A",
    "arkIdString": "ARK-A-S3-...",
    "appliedDelta": 0
  }
}
```

#### Status codes: `201` / `401` / `422`

---

### `POST /v1/resume/upload` — Upload a résumé file (SSE)

**Auth:** Any authenticated user.
**Content-Type:** `multipart/form-data` (≤20 MB)

#### Form fields
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF, DOCX, or TXT |

#### Response: SSE stream
This endpoint returns a Server-Sent Events stream. Connect with `EventSource` or `fetch` + ReadableStream.

**Events:**
| Event | Data shape | When |
|-------|-----------|------|
| `progress` | `{ step: "extracting", message: "..." }` | Extracting text from file |
| `progress` | `{ step: "analyzing", message: "..." }` | Analyzing content |
| `progress` | `{ step: "scoring", message: "..." }` | Computing ARK identity |
| `result` | `{ assessment: Assessment, identity: { ... } }` | Final result |
| `done` | `{ success: true }` | Stream complete |
| `error` | `{ message: "..." }` | Error occurred |

#### Status codes (initial): `200` (SSE begins) / `400` (no file) / `401`

**Important:** The frontend must handle SSE — use `fetch` with `ReadableStream` or an SSE client. The response stays open until `done` or `error` fires.

---

### `GET /v1/resumes` — List current user's uploaded resumes

**Auth:** Any authenticated user.

#### Response (200)
```json
{
  "data": [
    { "id": "uuid", "resumeUrl": "https://...", "createdAt": "..." },
    ...
  ]
}
```

---

## 9. CCGE (Card Game) — `/v1/ccge`

These endpoints are Pro+ gated (`forgeCards` module), but two of them allow admin/staff to view other users' data.

### Card object
```typescript
interface Card {
  id: string;          // uuid
  name: string;
  pillar: string;
  type: string;
  baseKcse: number;
  tokenCost: number;
  body: string | null;
}
```

### Session object
```typescript
interface Session {
  id: string;                    // uuid
  userId: string;                // uuid
  scenarioId: string;            // uuid
  dealtCardIds: string[];
  playedCardIds: string[] | null;
  kcseScore: number | null;
  status: string;
  finishedAt: string | null;
  createdAt: string;
}
```

---

### `GET /v1/ccge/sessions/user/{id}` — List a user's CCGE sessions

**Auth:** Self OR `admin` | `staff`

#### URL params: `id` (uuid) — the target user's ID

#### Response (200): `{ "data": [ Session, ... ] }`
#### Status codes: `200` / `401` / `403`

---

### Other CCGE endpoints (self-only, but available to admin as a regular user)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/v1/ccge/cards` | List all CCGE cards |
| `GET` | `/v1/ccge/scenarios?tier=Gold` | List scenarios (optional tier filter) |
| `GET` | `/v1/ccge/sessions/{id}` | Get a session (owner only) |
| `POST` | `/v1/ccge/sessions` | Start a session `{ scenarioId: "uuid" }` → `{ sessionId, scenarioId, dealtCardIds }` |
| `POST` | `/v1/ccge/sessions/{id}/finish` | Finish + score `{ playedCardIds: string[], customCard?, useClaude? }` → full scoring breakdown |

---

## 10. AI — `/v1/ai`, `/v1/admin/ai`

### AI Status object
```typescript
interface AIStatus {
  usage: { tokens: number; costCents: number };
  caps: { tokens: number; costCents: number };
  remaining: { tokens: number; costCents: number };
  ratioPct: number;              // percentage of budget used
  upgradeAtPct: number;
  hardStopAtPct: number;
  guardrailActive: boolean;
}
```

---

### `GET /v1/ai/status` — AI budget status

**Auth:** Any authenticated user. Returns the current user's AI usage vs. caps.

#### Status codes: `200` / `401`

---

### `GET /v1/ai/models` — List available AI models

**Auth:** Any authenticated user.

```json
{
  "preferred": "claude-haiku-4-5",
  "models": [
    { "id": "claude-haiku-4-5", "provider": "anthropic", "costTier": "low", "available": true },
    ...
  ]
}
```

**Status codes:** `200` / `401`

---

### `PUT /v1/ai/model-preference` — Set preferred model

**Auth:** Any authenticated user.

#### Request body
```json
{ "model": "claude-haiku-4-5" }
```
Set `model: null` to clear the preference (use defaults).

#### Status codes: `200` / `401` / `422` (unknown model)

---

### `POST /v1/ai/resume-narrative/{assessmentId}` — Generate resume narrative

**Auth:** Pro+ (requires `contextCraft` module).

#### URL params: `assessmentId` (uuid)

#### Response
```json
{
  "summary": "Narrative summary text...",
  "archetypeInsight": "As an Architect...",
  "topRisks": ["Risk 1", "Risk 2"],
  "growthPath": ["Step 1", "Step 2"],
  "generatedAt": "2026-08-06T...",
  "cached": false
}
```

#### Status codes: `200` / `401` / `402` (Pro required) / `403` / `404` / `502` (generation failed)

---

### `POST /v1/ai/job-role-guide` — Get O*NET/SFIA/WEF guide

**Auth:** Any authenticated user.

#### Request body
```json
{ "role": "Senior Frontend Developer" }   // 1–200 chars
```

#### Response
```json
{
  "role": "Senior Frontend Developer",
  "onet": ["Skill 1", "Skill 2"],
  "sfia": ["Competency 1", "Competency 2"],
  "wef": { "outlook": "...", "summary": "...", "signals": ["..."] },
  "cached": false
}
```

#### Status codes: `200` / `401` / `502` (generation failed)

---

### `POST /v1/admin/ai/generate-scenario` — Generate a CCGE scenario

**Role:** `admin` | `staff`

This is the only admin-exclusive AI endpoint. Uses Claude to generate a new CCGE scenario from a brief.

#### Request body
```json
{
  "brief": "A scenario about cloud migration challenges",   // required, min 1 char
  "industry": "Healthcare",                                 // optional
  "role": "CTO",                                            // optional
  "tierHint": "Gold"                                        // optional: Bronze|Silver|Gold|Platinum
}
```

#### Response (200)
```json
{
  "tier": "Gold",
  "title": "Cloud Migration at MedCorp",
  "prompt": "You are the CTO of...",
  "targetPillars": ["P3", "P5"],
  "tokenBudget": 5000,
  "difficulty": 7,
  "industry": "Healthcare",
  "isCustom": true
}
```

#### Status codes: `200` / `401` / `403` / `502` (generation failed)

---

## 11. SPHINX Marketplace — `/v1/sphinx`

All SPHINX routes are Pro+ gated (`contextCraft` module). No admin-exclusive routes, but admins can access these as regular users.

### Listing object
```typescript
interface Listing {
  id: string;                  // uuid
  creatorUserId: string;       // uuid
  title: string;
  description: string | null;
  body: string;
  pillar: string | null;
  hiveScore: number;
  kcseScore: number;
  price: number;               // integer (cents or points)
  status: string;
  scope: string;               // "OPEN" | "CORPORATE" | "BOTH"
  institution: string | null;
  createdAt: string;
}
```

### Key endpoints

| Method | Path | Body | Response | Purpose |
|--------|------|------|----------|---------|
| `POST` | `/v1/sphinx/hive-precheck` | `{ title, body, pillar? }` | Analysis with letterGrade, hiveScore, suggestions | Analyze draft before publishing |
| `POST` | `/v1/sphinx/listings` | `{ title, desc?, body, pillar?, price, hiveScore, kcseScore?, scope?, institution? }` | Listing (201) | Publish an SPC |
| `GET` | `/v1/sphinx/listings` | — | `{ data: Listing[] }` | Browse active listings |
| `POST` | `/v1/sphinx/listings/{id}/analyze` | — | Analysis | Analyze existing listing |
| `POST` | `/v1/sphinx/listings/{id}/purchase` | — | `{ purchaseId, listingId, price, creatorShare, platformShare, isFirstSaleForCreator }` | Buy a listing (70/30 split) |

---

## 12. F1000 Founding Member Promo — `/v1/f1000`

### `GET /v1/f1000/stats` — Live counter

**Public.** No auth required. Useful for the admin dashboard.

#### Response
```json
{ "total": 1000, "claimed": 423, "remaining": 577 }
```

---

### `POST /v1/f1000/claim` — Claim a code

**Auth:** Any authenticated user.
**Rate limit:** 10 per minute (dedicated limiter).

#### Request body
```json
{ "code": "F1000-7K3M-9QX2" }
```

#### Response (200)
```json
{ "code": "F1000-7K3M-9QX2", "seq": 423, "alreadyClaimed": false, "member": true }
```

#### Status codes: `200` / `401` / `404` (invalid code) / `409` (already claimed / one per account) / `410` (sold out) / `422`

---

## 13. Multi-Provider File Analysis — `/api/analyze`

### `POST /api/analyze` — Analyze files with LLM

**Auth:** Any authenticated user.
**Content-Type:** `multipart/form-data` (≤20 MB)

#### Form fields
| Field | Type | Description |
|-------|------|-------------|
| `files` | File[] | One or more files |
| `prompt` | string | Optional prompt (default: "Summarize these files.") |
| `provider` | `"anthropic"` \| `"openai"` \| `"gemini"` | Optional, defaults to first configured provider |

#### Response (200)
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5",
  "answer": "Analysis text...",
  "ingestionErrors": []
}
```

#### Status codes
| Status | Meaning |
|--------|---------|
| `200` | Success |
| `400` | Bad request (no files, unknown provider) |
| `422` | All files failed to ingest |
| `500` | Internal error |
| `503` | No LLM provider configured |

---

## 14. Webhook (System) — `/v1/webhook/stripe`

### `POST /v1/webhook/stripe` — Stripe webhook

**No session auth.** Validated via `stripe-signature` header.

This is a system endpoint — the COMMAND CENTER doesn't call it directly. Stripe sends events here. Documented for completeness.

#### Status codes: `200` (acknowledged) / `400` (missing/invalid signature)

---

## 15. Operational Endpoints

### `GET /v1/feature-flags` — All feature flag states

**Auth:** Any authenticated user.

Returns the current on/off state of every feature flag:
```json
{
  "ark_score": true,
  "matchmaking": true,
  "f1000_promo": true,
  "enterprise_intelligence": false,
  ...
}
```

Use this to conditionally show/hide admin UI sections.

---

### `GET /healthz` — Liveness probe

**Public.** No auth.

```json
{ "status": "ok" }
```

---

### `GET /doc` — OpenAPI JSON

**Public.** Full OpenAPI 3.0 spec.

---

### `GET /docs` — Swagger UI

**Public.** Interactive API docs.

---

## 16. Quick Reference — Every Admin Endpoint

| Method | Path | Role | Query Filters | Section |
|--------|------|------|--------------|---------|
| `GET` | `/v1/users` | admin, staff | `page`, `pageSize`, `search`, `role`, `type` | §3 |
| `GET` | `/v1/users/{id}` | admin, staff | — | §3 |
| `POST` | `/v1/users` | admin | — | §3 |
| `PATCH` | `/v1/users/{id}` | admin | — | §3 |
| `DELETE` | `/v1/users/{id}` | admin | — | §3 |
| `PATCH` | `/v1/users/{id}/deactivate` | admin, staff | — | §3 |
| `GET` | `/v1/plans` | admin, staff | `page`, `pageSize`, `search`, `freeTrial` | §4 |
| `GET` | `/v1/plans/{id}` | admin, staff | — | §4 |
| `POST` | `/v1/plans` | any auth | — | §4 |
| `PATCH` | `/v1/plans/{id}` | any auth | — | §4 |
| `DELETE` | `/v1/plans/{id}` | admin, staff | — | §4 |
| `GET` | `/v1/plans/public` | public | — | §4 |
| `GET` | `/v1/payments` | admin, staff | `page`, `pageSize`, `userId`, `status` | §5 |
| `GET` | `/v1/payments/me` | any auth | `page`, `pageSize`, `status` | §5 |
| `GET` | `/v1/payments/{id}` | admin, staff | — | §5 |
| `POST` | `/v1/payments` | any auth | — | §5 |
| `PATCH` | `/v1/payments/{id}` | any auth | — | §5 |
| `DELETE` | `/v1/payments/{id}` | admin, staff | — | §5 |
| `GET` | `/v1/subscriptions` | admin, staff | `page`, `pageSize`, `userId`, `planId`, `status` | §6 |
| `GET` | `/v1/subscriptions/me` | any auth | — | §6 |
| `GET` | `/v1/subscriptions/{id}` | admin, staff | — | §6 |
| `POST` | `/v1/subscriptions` | any auth | — | §6 |
| `PATCH` | `/v1/subscriptions/{id}` | any auth | — | §6 |
| `DELETE` | `/v1/subscriptions/{id}` | admin, staff | — | §6 |
| `GET` | `/v1/resume-counts` | admin, staff | `page`, `pageSize`, `id`, `userId`, `search` | §7 |
| `GET` | `/v1/resume-counts/me` | any auth | — | §7 |
| `GET` | `/v1/assessments/user/{id}/latest` | self, admin, staff | — | §8 |
| `GET` | `/v1/assessments/user/{id}` | self, admin, staff | — | §8 |
| `POST` | `/v1/assessments` | any auth | — | §8 |
| `POST` | `/v1/resume/upload` | any auth | — | §8 |
| `GET` | `/v1/resumes` | any auth | — | §8 |
| `GET` | `/v1/ccge/sessions/user/{id}` | self, admin, staff | — | §9 |
| `GET` | `/v1/ai/status` | any auth | — | §10 |
| `GET` | `/v1/ai/models` | any auth | — | §10 |
| `PUT` | `/v1/ai/model-preference` | any auth | — | §10 |
| `POST` | `/v1/ai/resume-narrative/{id}` | Pro+ | — | §10 |
| `POST` | `/v1/ai/job-role-guide` | any auth | — | §10 |
| `POST` | `/v1/admin/ai/generate-scenario` | admin, staff | — | §10 |
| (6 SPHINX) | `/v1/sphinx/*` | Pro+ | — | §11 |
| `GET` | `/v1/f1000/stats` | public | — | §12 |
| `POST` | `/v1/f1000/claim` | any auth | — | §12 |
| `POST` | `/api/analyze` | any auth | — | §13 |
| `POST` | `/v1/webhook/stripe` | system | — | §14 |
| `GET` | `/v1/feature-flags` | any auth | — | §15 |
| `GET` | `/healthz` | public | — | §15 |

---

## 17. COMMAND CENTER Dashboard — Suggested Layout

Based on the endpoints above, here's a recommended page structure:

### Dashboard Home
- **Stats cards:** total users (from `/v1/users`), active subscriptions (from `/v1/subscriptions?status=active`), F1000 claimed/remaining (from `/v1/f1000/stats`), feature flags enabled count (from `/v1/feature-flags`).
- **AI budget overview:** from `/v1/ai/status`.

### Users Management
- **Table:** `/v1/users` with pagination.
- **Filters bar:** search input, role dropdown, type dropdown.
- **Row actions:** View detail → `/v1/users/{id}`, Edit → `PATCH`, Deactivate → `PATCH .../deactivate`, Delete → `DELETE` (admin only).
- **Create button:** opens modal/form → `POST /v1/users`.

### Plans Management
- **Cards/table:** `/v1/plans`.
- **Filters:** search, freeTrial toggle.
- **Create/Edit/Delete** per role gating.

### Payments & Subscriptions
- **Payments table:** `/v1/payments` with userId and status filters.
- **Subscriptions table:** `/v1/subscriptions` with userId, planId, and status filters.
- **Detail views** for single records.

### User Lookup (Support)
- Search for a user by email/name → `/v1/users?search=...`.
- Click into user → see their assessments (`/v1/assessments/user/{id}`), CCGE sessions (`/v1/ccge/sessions/user/{id}`), resume counts (`/v1/resume-counts?userId=...`), payments (`/v1/payments?userId=...`), subscription (`/v1/subscriptions?userId=...`).

### AI Tools
- **Scenario generator:** form → `POST /v1/admin/ai/generate-scenario`.
- **AI budget dashboard:** from `/v1/ai/status`.
- **Model management:** from `/v1/ai/models` + `PUT /v1/ai/model-preference`.

### F1000 Monitor
- **Live counter:** `GET /v1/f1000/stats` (poll every 30s).

### Feature Flags
- **Toggle view:** `GET /v1/feature-flags` (read-only display of all 24 flags and their states).

---

## 18. Error Handling Strategy for the COMMAND CENTER

| Status | UI Action |
|--------|----------|
| `200` / `201` | Normal render |
| `401` | Redirect to login, preserve return URL |
| `403` | Show "You don't have permission for this action." If the user is staff and the endpoint is admin-only, hide the button entirely (don't let them click it). |
| `404` | Show "Not found" with back button |
| `409` | Show the conflict message (e.g. "Email already exists") |
| `422` | Show validation errors inline on the form |
| `429` | Show retry countdown based on `Retry-After` header |
| `500` / `502` / `503` | Show "Something went wrong" with a retry button |

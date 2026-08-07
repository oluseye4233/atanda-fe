# Career Mobility & Pathways — Frontend Integration Guide

**For:** The LLM building the user dashboard, specifically the `pathways.tsx` page.
**What changed:** `GET /v1/assessments/user/{id}/latest` and `GET /v1/assessments/user/{id}` now include `transferabilityVectors`, `pivotOpportunities`, and `upskillingPlans` in the response.

---

## 1. The Endpoint

### `GET /v1/assessments/user/{id}/latest`

**Auth:** Self OR admin/staff. Session required.

#### Response shape (new fields in **bold**)
```json
{
  "id": "uuid",
  "userId": "uuid",
  "jstTotal": 180,
  "jstJobs": 55,
  "jstSkills": 70,
  "jstTalent": 55,
  "vulnerabilityLevel": 2,
  "readinessProfile": "Adaptable",
  "riskModifiers": [
    { "task": "Data entry", "automatable": 85 },
    { "task": "Report generation", "automatable": 72 }
  ],
  "matchedCardIds": ["prim-prompt-001", "prim-analytics-001"],
  "archetypeArchitect": 12,
  "archetypeOrchestrator": 5,
  "archetypeConductor": 3,
  "contextCraftLevel": "CC_100",
  "resumeUrl": "https://...",
  "createdAt": "2026-08-01T00:00:00Z",
  "transferabilityVectors": [
    { "id": "uuid", "assessmentId": "uuid", "subject": "Industry Mobility", "score": 72 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Tech Fluency", "score": 85 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Data Literacy", "score": 60 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Leadership Scal.", "score": 48 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Creative Problem", "score": 78 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Comm. Impact", "score": 55 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Agility Index", "score": 68 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Domain Breadth", "score": 52 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Execution Speed", "score": 73 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Innovation Trans.", "score": 80 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Geographic Port.", "score": 70 },
    { "id": "uuid", "assessmentId": "uuid", "subject": "Strategic Vision", "score": 45 }
  ],
  "pivotOpportunities": [
    { "id": "uuid", "assessmentId": "uuid", "role": "AI Integration Manager", "feasibility": 82, "gapCost": "$2,400", "time": "6 Months" },
    { "id": "uuid", "assessmentId": "uuid", "role": "Data Strategy Lead", "feasibility": 65, "gapCost": "$4,100", "time": "9 Months" },
    { "id": "uuid", "assessmentId": "uuid", "role": "Innovation Program Lead", "feasibility": 58, "gapCost": "$4,800", "time": "10 Months" }
  ],
  "upskillingPlans": [
    { "id": "uuid", "assessmentId": "uuid", "phase": "30-Day", "type": "ready-skilling", "title": "Advanced AI Orchestration Patterns", "description": "Extend existing AI proficiency...", "hours": 15 },
    { "id": "uuid", "assessmentId": "uuid", "phase": "90-Day", "type": "up-skilling", "title": "Cloud-Native Architecture Mastery", "description": "Deepen multi-cloud expertise...", "hours": 45 },
    { "id": "uuid", "assessmentId": "uuid", "phase": "12-Month", "type": "new-skilling", "title": "Digital Transformation Specialist", "description": "Transition into a hybrid role...", "hours": 150 }
  ]
}
```

#### Status codes
| Status | Meaning |
|--------|---------|
| `200` | Success |
| `401` | No session — redirect to login |
| `403` | Self-or-admin/staff check failed |
| `404` | No assessment exists for this user |

#### Error shape
```json
{ "message": "No assessment found" }
```

---

## 2. Data → Component Mapping

### 2.1 TransferabilityRadar

**Source:** `assessment.transferabilityVectors`

**Shape you receive:**
```typescript
interface TransferabilityVector {
  id: string;
  assessmentId: string;
  subject: string;   // e.g. "Tech Fluency", "Industry Mobility"
  score: number;     // 0–100
}
```

**How to render:**
- Radar chart with each vector as an axis (label = `subject`, value = `score`).
- Always 12 vectors. Sorted by `subject` alphabetically, but you can reorder for visual grouping.
- Score below 40 = red zone, 40–60 = amber, 60–80 = green, 80+ = bright green.

**Edge case:** The array is always present and always has 12 entries. If the user hasn't been assessed, the endpoint returns `404` — you'll handle this at the page level (see Section 3).

---

### 2.2 Top Pivot Opportunities (FlippableCard list)

**Source:** `assessment.pivotOpportunities`

**Shape you receive:**
```typescript
interface PivotOpportunity {
  id: string;
  assessmentId: string;
  role: string;        // e.g. "AI Integration Manager"
  feasibility: number; // 0–100
  gapCost: string;     // e.g. "$2,400"
  time: string;        // e.g. "6 Months"
}
```

**How to render:**
- 1–3 opportunities, sorted by `feasibility` descending (already sorted by the server).
- Each card front: `role`, `feasibility` (big number, color-coded), `gapCost`, `time`.
- Card flip: narrative based on `feasibility` threshold:

| Feasibility | Narrative |
|-------------|-----------|
| ≥80 | "Strong fit — most core skills already transfer" |
| 60–79 | "Solid pivot — targeted upskilling closes the gap" |
| 40–59 | "Moderate lift — plan for structured transition period" |
| <40 | "Long-haul pivot — treat as a 12+ month roadmap" |

- Show `gapCost` as "Estimated investment: $X,XXX" and `time` as "Timeline: X Months".

**Edge case:** If `pivotOpportunities` is empty (shouldn't happen — the generator always produces at least 1 fallback), show "No pivot recommendations available yet."

---

### 2.3 UpskillingTimeline

**Source:** `assessment.upskillingPlans`

**Shape you receive:**
```typescript
interface UpskillingPlan {
  id: string;
  assessmentId: string;
  phase: string;       // "30-Day" | "90-Day" | "12-Month"
  type: string;        // "ready-skilling" | "up-skilling" | "new-skilling"
  title: string;
  description: string;
  hours: number;       // estimated hours
}
```

**How to render:**
- Always 3 plans (one per phase: 30-Day, 90-Day, 12-Month).
- Render as a vertical timeline, chronologically ordered.
- Each node: phase badge, type tag, title (bold), description, hours (e.g. "~20 hours").
- Color-code `type`: `ready-skilling` = blue, `up-skilling` = amber, `new-skilling` = purple.

---

### 2.4 SkillGapMatrix

**Source:** Combine `assessment.pivotOpportunities` (columns) × `assessment.transferabilityVectors` (rows).

**How to render:**
- Rows: the 12 transferability vectors (`subject`).
- Columns: each pivot opportunity (`role`).
- Cell value: the vector's `score`. This is the user's current proficiency in that transferability dimension — it applies uniformly (the vectors aren't per-pivot, they're global to the user).
- Heatmap: low scores (red) indicate dimensions that need work for any pivot; high scores (green) are strengths.

**Edge case:** Since vectors are global (not per-pivot), this is a simplified matrix. The "gap" for a given pivot is implied by the feasibility score, not by a per-pivot vector difference. If you want true per-pivot skill gaps, you'd need to use the matchmaking endpoints (`/v1/matchmaking/{id}`) which do per-requirement breakdowns.

---

## 3. Page-Level Integration

### Data fetching

```typescript
// React Query example
const { data: assessment, isLoading, error } = useQuery({
  queryKey: ['assessment', userId],
  queryFn: () => resumeService.getLatest(userId),
  enabled: !!userId,
});
```

### Page states

| State | What to show |
|-------|-------------|
| **Loading** | Skeleton placeholders for radar, pivot cards, timeline |
| **Error 404** | "No assessment data found. Upload a résumé first." with a CTA button to the upload page |
| **Error 401** | Redirect to login |
| **Error (other)** | "Something went wrong. Please try again." with retry button |
| **Success, no data arrays** | Shouldn't happen — if the endpoint returns 200, all three arrays are populated. But defensively fall back to empty arrays |
| **Success** | Render all four components |

### Plan gating

The page is already gated behind the Pro plan via `UpgradeGate` (`canAccessPathways`). Keep this gating — it checks the `careerPathways` plan module. If the user is on Explorer, they see the upgrade prompt, not the pathways content.

---

## 4. TypeScript Types

Copy these into your frontend types file:

```typescript
interface TransferabilityVector {
  id: string;
  assessmentId: string;
  subject: string;
  score: number;
}

interface PivotOpportunity {
  id: string;
  assessmentId: string;
  role: string;
  feasibility: number;
  gapCost: string;
  time: string;
}

interface UpskillingPlan {
  id: string;
  assessmentId: string;
  phase: string;
  type: string;
  title: string;
  description: string;
  hours: number;
}

// Extend your existing Assessment type
interface AssessmentWithPathways extends Assessment {
  transferabilityVectors: TransferabilityVector[];
  pivotOpportunities: PivotOpportunity[];
  upskillingPlans: UpskillingPlan[];
}
```

---

## 5. What Changed (for the frontend dev)

**Before:** `transferabilityVectors`, `pivotOpportunities`, and `upskillingPlans` were `undefined` on the assessment response. The pathways page would crash or show "no data."

**After:** These fields are always present on a successful `200` response. The arrays are guaranteed non-null (though defensively treat them as possibly empty).

No breaking changes to existing fields. The assessment object still has `jstTotal`, `archetypeArchitect`, `vulnerabilityLevel`, etc. exactly as before.

---

## 6. Checklist

- [ ] Update the `Assessment` TypeScript type to include the three new arrays
- [ ] Update `TransferabilityRadar` to read `assessment.transferabilityVectors` instead of `assessment.transferabilityVectors` (it was already wired, just getting `undefined`)
- [ ] Update `TopPivotOpportunities` / `FlippableCard` to read `assessment.pivotOpportunities`
- [ ] Update `UpskillingTimeline` to read `assessment.upskillingPlans`
- [ ] Update `SkillGapMatrix` to read both arrays
- [ ] Test with a user who has an existing assessment (re-upload a résumé to generate fresh data if needed)
- [ ] Test the empty state (user with no assessment — should see the upload CTA)

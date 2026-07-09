---
inclusion: always
---

# ARK Platform — Refactoring & Technical Standards

## Architecture Principles

### Separation of Concerns (Progressive)
- Break files apart **as you work on them**, not preemptively.
- A file that needs touching is a file that can be split.
- Target: no page file > 400 lines, no component > 200 lines.
- Extract sub-components when they have their own local state or are reused.
- Keep data-fetching hooks separate from rendering components.

### File Structure Conventions
```
client/src/
  pages/          # Route-level page components (thin orchestrators)
  components/
    ui/           # shadcn primitives — do not modify
    layout/       # AppLayout, Sidebar, TopBar, etc.
    dashboard/    # Dashboard-specific display widgets
    marketplace/  # Marketplace sub-components (when splitting marketplace.tsx)
    shared/       # Cross-page reusable components
  hooks/          # use* hooks — data fetching, UI state
  lib/            # Pure utilities, API client, theme constants
shared/           # Client-safe constants, types, pure functions (NO server imports)
```

### Page Components
- Pages are **orchestrators**: they fetch data and pass it to display components.
- No page should contain inline sub-components that have their own hooks unless trivially small.
- When a page exceeds ~400 lines, extract the largest self-contained visual block first.

---

## Routing & Auth

### Route Categories
- **Public routes** (`/`, `/login`, `/signup`, `/r/:token`, `/confirm/:token`): rendered **without** the sidebar shell. Full-page layouts.
- **Auth-required routes** (everything else): rendered inside `AppLayout` with sidebar nav.
- The `AppLayout` must gate on auth state — unauthenticated users hitting a protected route redirect to `/login`.

### Auth Rules
- `useAuth()` is the single source of truth. Never duplicate session state.
- Login → redirect to `/dashboard` (not `/`).
- Logout button must always be visible in the sidebar Account section when a user is logged in.
- Unauthenticated users see the landing page at `/` with full-page layout (no sidebar).

---

## Typography

| Usage | Font | Tailwind class |
|---|---|---|
| Hero h1, section headings | Orbitron | `font-display` |
| Body text, descriptions, labels | DM Sans | `font-sans` |
| Code labels, badges, nav items, monospace data | Space Grotesk | `font-mono` |

- **Do not use Rajdhani** — replaced by DM Sans for body text.
- `font-sans` = DM Sans going forward.
- `font-display` = Orbitron (headings, hero only — use sparingly).
- Heading hierarchy: `font-display` for h1/h2 only; h3 and below use `font-sans font-semibold`.

---

## Component Patterns

### Data Fetching
- Use `useQuery` from `@tanstack/react-query` for all server data.
- On 401/404/network error, components must render gracefully (empty state, not crash).
- Never throw from `queryFn` on auth errors — return `null` instead.

### State Management
- No global state outside of React Query cache + `useAuth`.
- Co-locate component state with the component that owns it.
- Lift state only when two sibling components need the same value.

### Error Handling
- All pages are wrapped in `ErrorBoundary` via `App.tsx` — don't add more boundaries inside pages unless genuinely isolated.
- API errors should surface in the UI as inline messages, not console logs.

---

## Styling

### Tailwind v4 Conventions
- Use `bg-linear-to-*` not `bg-gradient-to-*` (Tailwind v4 changed this).
- Use `shrink-0` not `flex-shrink-0`.
- Use `bg-white/2` not `bg-white/[0.02]`.
- Prefer semantic color tokens (`text-muted-foreground`, `bg-card`, etc.) over raw hex.

### Responsive Breakpoints
- Mobile-first. Default styles = mobile.
- `sm:` = 640px+, `md:` = 768px+, `lg:` = 1024px+, `xl:` = 1280px+.
- Touch targets: min 44×44px on mobile.
- Sidebar is hidden on mobile, replaced by hamburger drawer.

### Glass / Neon Utilities (defined in index.css)
- `.glass` — subtle glass panel (nav, overlays)
- `.glass-card` — content card with primary border glow
- `.neon-text` — primary color text glow
- `.neon-border` — primary color box shadow glow
- Use these consistently; don't reinvent inline box-shadow variants.

---

## When Splitting a Large File

Follow this order:
1. Extract **display-only sub-components** (no hooks, just props → JSX) into `components/<feature>/`.
2. Extract **local hooks** (`useXxxState`, data fetching logic) into `hooks/`.
3. What remains in the page file should be a thin orchestrator: fetch → pass props → render layout.

### Practical Trigger
- You are modifying `marketplace.tsx`, `dashboard.tsx`, or `play.tsx` → split the section you're touching into its own component file.
- Name the extracted file after what it does, not where it came from: `SpcListingCard.tsx`, `AiAnalysisPanel.tsx`, not `MarketplacePart1.tsx`.

---

## Backend Connectivity

- The client is **currently standalone** — no backend is running.
- All `useQuery` / `api.*` calls must fail gracefully (empty states, not crashed UI).
- `useAuth()` returns `null` user when `/api/auth/me` fails — this is correct behavior.
- When reconnecting the backend: restore `tsc && vite build` in `package.json` scripts, and revert the `useAuth` error-swallowing to the original throw-on-non-401 behavior.

---

## Checklist Before Committing a Change

- [ ] `bun run check` passes (zero TypeScript errors)
- [ ] `bun run build` succeeds
- [ ] New component has a `data-testid` on its root element
- [ ] No `any` types introduced without a comment explaining why
- [ ] No new drizzle/server imports in `shared/` or `client/`
- [ ] Responsive: tested mentally at 375px, 768px, 1280px

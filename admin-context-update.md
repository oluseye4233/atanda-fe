# Command Center admin module — progress snapshot

## Done
- Services/types: `feature-flags.service.ts`, `types/feature-flags.ts`; `resume.service.ts` now has `listCounts`.
- Lazy-loaded admin app: `client/src/app/AdminApp.tsx` with static admin-page imports.
- Subdomain check in `client/src/App.tsx` renders `AdminApp` on `command-center.*`.
- Role guard: `components/admin/AdminGuard.tsx`.
- Layout: `components/admin/AdminLayout.tsx` mirrors `AppLayout` without shared-folder deps.
- Reusable admin UI helpers: `StatCard`, `ErrorAlert`, `StatusBadge`, `PaginationControls`, `ConfirmDialog`.
- Dashboard page: stats cards + AI budget overview.

## In progress / remaining
- Implement admin pages:
  - `pages/admin/users.tsx`
  - `pages/admin/user-detail.tsx`
  - `pages/admin/plans.tsx`
  - `pages/admin/payments.tsx`
  - `pages/admin/ai.tsx`
  - `pages/admin/f1000.tsx`
  - `pages/admin/feature-flags.tsx`
- Add `Checkbox` import paths may need verification.
- Run `tsc --noEmit` / build after pages are in place.
- Note: existing `pages/admin-ccge-import.tsx` is not wired in; it imports a non-existent `@/lib/api`.

# Engineering Instructions

These are standing instructions for writing and modifying code in this repository. They apply to every file the assistant touches, whether writing new code or editing existing code. If a request conflicts with these instructions, flag the conflict instead of silently picking one.

---

## 1. File Structure & Modularity

**Never dump unrelated logic into one file.** If you catch yourself about to write more than ~150-200 lines of distinct concerns into a single file, stop and split it.

### API layer — one file per resource, not per project

Wrong:
```
api.ts   ← 30 endpoints + client init + types + error handling
```

Rules:
- `api.ts` only initializes the HTTP client (base URL, headers, interceptors, timeout, auth token injection). It exports the client instance and nothing else.
- Each resource file exports functions, not a class with 30 methods, unless the project already uses a class-based pattern.
- One `index.ts` barrel file re-exports the public surface — don't make consumers import from 8 different deep paths.
- If an endpoint file exceeds ~10-12 functions or 200 lines, split further by sub-resource (e.g. `orders.ts` → `orders.ts` + `orders.refunds.ts`).

### General component/module structure
- One component per file. If a component needs 3+ tightly-coupled subcomponents, give them their own folder (`Modal/index.tsx`, `Modal/ModalHeader.tsx`, `Modal/useModalState.ts`).
- Hooks that exceed one clear responsibility get extracted (`useUserData` should not also manage websocket reconnection — split into `useUserData` + `useSocketConnection`).
- Shared types go in `types.ts` files close to where they're used, not in one giant `types.ts` at the root once the project grows past a handful of domains.
- If in doubt: **can this file's purpose be described in one sentence without "and"?** If not, split it.

---

## 2. TypeScript Discipline

- No `any` unless there's a comment explaining why it's unavoidable (e.g. third-party lib with no types). Prefer `unknown` + narrowing.
- Every API response gets a typed shape — don't let `fetch().json()` return `any` silently through the app.
- Use discriminated unions for state that has distinct shapes (e.g. `{ status: 'loading' } | { status: 'error', error: string } | { status: 'success', data: T }`) instead of a pile of optional booleans.
- Avoid non-null assertions (`!`) except where you've genuinely proven safety a line above; prefer optional chaining + explicit fallback.
- Export types alongside the functions that use them, not from a disconnected global dump.

---

## 3. Frontend Performance

- **Don't re-render what didn't change.** Memoize expensive computations (`useMemo`) and callbacks passed to memoized children (`useCallback`) — but don't cargo-cult it onto everything; only where profiling or obvious cost (large lists, heavy derived data) justifies it.
- **List rendering:** virtualize any list that can realistically exceed ~100-200 items (react-window / react-virtual). Never render an unbounded list directly.
- **Code-split by route** at minimum (`React.lazy` + `Suspense`). Split further around heavy, rarely-used features (charts, editors, modals with big deps).
- **Images:** always set explicit width/height or aspect-ratio to prevent layout shift; lazy-load offscreen images; use responsive/appropriately-sized assets rather than shipping full-res everywhere.
- **Bundle awareness:** don't import an entire library for one function (e.g. `import _ from 'lodash'` → `import debounce from 'lodash/debounce'`). Check bundle cost before adding a new dependency for something trivial.
- **Debounce/throttle** anything tied to high-frequency events: search input, scroll handlers, resize handlers, window mousemove.
- **Network:** dedupe in-flight identical requests where relevant, cache responses that don't need to be fresh every render (react-query / SWR over manual `useEffect` fetch when the project's scale justifies it).

---

## 4. Memory Leak Prevention

This is a common failure mode in generated frontend code — be deliberate about it.

- **Every `useEffect` that subscribes, listens, or starts something must clean up.** Event listeners, `setInterval`/`setTimeout`, WebSocket connections, IntersectionObserver/ResizeObserver, third-party SDK subscriptions — all need a return cleanup function that tears them down.
  ```ts
  useEffect(() => {
    const controller = new AbortController();
    fetchData({ signal: controller.signal });
    return () => controller.abort();
  }, []);
  ```
- **Abort in-flight requests** on unmount or when params change, using `AbortController`, so stale responses don't try to `setState` on an unmounted component.
- **Don't set state after unmount.** Prefer abort signals / cleanup flags over ignoring the warning.
- **Clear timers explicitly.** Every `setInterval`/`setTimeout` inside an effect gets a matching `clearInterval`/`clearTimeout` in the cleanup.
- **Remove global listeners you add** (`window.addEventListener`, `document.addEventListener`) in the same effect that added them.
- **Watch closures in loops/callbacks** that capture large objects or DOM nodes — don't hold onto references longer than needed.
- **WebSockets/SSE:** close the connection in cleanup; don't rely on the server timing it out.

---

## 5. UX & User-Facing Behavior

Write code as if a real, impatient user is on the other end.

- **Every async action has three visible states minimum:** loading, error, success. Never leave a user staring at a blank screen or a silently-failed action.
- **Errors are actionable, not raw.** Don't surface `error.message` from an Axios/network error directly to the UI — map it to something a human can act on ("Couldn't save changes — check your connection and try again"), and log the raw error for debugging.
- **Optimistic updates** where the interaction expects instant feedback (likes, toggles, drag-reorder) — with rollback on failure.
- **Disable/guard double-submits.** Buttons that trigger network calls should disable or debounce during the in-flight request.
- **Preserve user input on failure.** If a form submit fails, never clear the form.
- **Respect reduced motion / accessibility basics:** honor `prefers-reduced-motion`, ensure interactive elements are keyboard-reachable and have visible focus states, use semantic HTML before reaching for ARIA.
- **Empty states matter.** Design for "no data yet," not just the happy path with data.

---

## 6. General Practices

- **Small, reviewable diffs.** Prefer several focused changes over one sprawling one, even within a single task.
- **No dead code left behind.** Remove commented-out blocks, unused imports, unused variables before considering a task done.
- **Naming over comments.** A well-named function/variable beats a comment explaining a poorly-named one. Comments explain *why*, not *what*.
- **Don't silently swallow errors.** Every `catch` either handles the error meaningfully or re-throws/logs — never an empty `catch {}`.
- **Consistent formatting/linting** — run existing lint/format tooling rather than introducing a personal style that fights the project's config.
- **Before writing new code, check what already exists** in the codebase (utils, hooks, types) to avoid duplicating logic that's already been solved elsewhere in the project.

---

## 7. When Generating Many Similar Items (e.g. endpoints, components, routes)

This is specifically for the failure mode of dumping 30 endpoints into one file:

1. **Plan the file structure first**, before writing code — group by resource/domain, not by "all API stuff."
2. **Write one file's worth, then stop and check size/scope** before continuing to the next, rather than streaming everything into a single buffer.
3. **If asked to scaffold a large surface area** (many endpoints, many CRUD screens), default to splitting by domain and ask only if the domain boundaries are genuinely ambiguous — otherwise proceed with a sensible split and state the assumption.
---
inclusion: always
---

# ARK Platform — Design System

## Core Aesthetic

The platform is a **dark cyberpunk intelligence tool** — not a consumer app. The vibe is precision, depth, and latent energy. Dark backgrounds, controlled neon accents, tactile surfaces. It should feel like a mission control dashboard dressed as a product.

The landing page breaks this with intentional contrast: dark hero, light informational sections, dark footer. This is deliberate — the light sections make content scannable; the dark bookends frame the product identity.

---

## Typography

### Font Stack

| Role | Font | Variable | Notes |
|---|---|---|---|
| Hero H1 only | Orbitron | `font-display` | Strictly the hero `<h1>`. Nothing else. |
| All other headings | DM Sans | `font-sans font-bold` or `font-semibold` | h2, h3, h4 — clean, readable |
| Body / descriptions | DM Sans | `font-sans` | Default everywhere |
| Labels, badges, nav, data | Space Grotesk | `font-mono` | Caps + tracking for UI chrome |

### Rules
- `font-display` appears **exactly once per page**: the hero h1. Brand logotype (`ARK`) in the nav is also acceptable.
- Never use Orbitron for section titles, card headings, or UI labels — it makes the whole page feel like a loading screen.
- `font-mono` is for UI chrome (nav items, status badges, tags, code). Not for body copy.
- `tracking-tight` on DM Sans headings. `tracking-widest` on mono labels.

---

## Color Tokens

```
--primary     : hsl(188 86% 53%)   → Cyan     — primary actions, links, active states
--secondary   : hsl(152 69% 31%)   → Emerald  — success, secondary accent
--destructive : hsl(346 87% 43%)   → Crimson  — risk, warnings, destructive actions
--background  : hsl(222 47% 11%)   → Deep navy — dark page background
--muted-foreground: hsl(215 22% 74%) → Readable body text on dark bg
```

### Usage
- **Cyan** for CTAs, active states, primary borders, glow effects.
- **Emerald** for success states, secondary CTAs, positive indicators.
- **Crimson** for risk scores, danger zones, error states.
- Never use raw hex in components — always use CSS tokens or Tailwind semantic classes.

---

## Surface & Card System

### Three card levels

**1. `card-surface`** — Default elevated surface. Dark page sections.
```
rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm
shadow-[0_1px_3px_rgba(0,0,0,0.4)]
hover: border-white/14, translateY(-2px)
```

**2. `card-surface-accent`** — Primary-accented card. Use for feature highlights, CTA cards.
```
card-surface + border-primary/25 + subtle primary glow
hover: border-primary/40, stronger glow
```

**3. Light section card** — White card on `section-light` background.
```
rounded-2xl border border-slate-200 bg-white p-6
shadow-[0_1px_4px_rgba(0,0,0,0.07)]
hover: shadow-[0_8px_30px_rgba(0,0,0,0.10)], translateY(-2px)
```

### Card Don'ts
- No flat cards with no border at all — surfaces need definition.
- No `rounded-lg` on cards — use `rounded-2xl` for a modern feel.
- Don't recreate inline box-shadows — use the `.glass-card` or `card-surface` utilities.
- Avoid putting `backdrop-blur` on cards inside light sections — it kills performance and looks odd on white.

---

## Layout & Section Rhythm

### Landing Page Section Pattern
```
Hero          → dark  (bg-background)  — animated texture, full viewport
How It Works  → light (section-light)  — white cards, max contrast for scanning
Features      → dark  (bg-background)  — card-surface-accent, neon accents
Pricing       → light (section-light)  — clean white cards, easy comparison
CTA           → dark  (bg-background)  — single card-surface-accent, focused
Footer        → deep dark (hsl 222 47% 8%) — slightly darker than body
```

The alternation creates visual rhythm and prevents the "wall of dark" problem. Never do more than two consecutive sections of the same tone.

### Section Spacing
- Section vertical padding: `py-20` minimum, `py-24` preferred.
- Section max-width container: `max-w-5xl mx-auto`.
- Section inner heading block: `text-center mb-12` or `mb-14`.

---

## Background Textures

### Hero Animated Texture (CSS-only, no image files)
Three layers composited with `pointer-events: none`:
1. **Grain overlay** — `.hero-grain` class. SVG feTurbulence noise, animates at 0.6s steps to look alive.
2. **Drifting orb 1** — `.hero-texture-orb-1`. Large cyan radial gradient, 14s drift cycle.
3. **Drifting orb 2** — `.hero-texture-orb-2`. Emerald radial gradient, 18s drift cycle.

These replace the original `hero_wave_dark_compressed.mp4` video that is no longer available.

### Body Grid
Defined on `body` in `index.css` — a 50px dot grid at 2% opacity. Provides baseline texture across all dark pages without being distracting.

---

## Spacing & Shape

- Border radius: `rounded-xl` (cards, buttons), `rounded-2xl` (cards, panels), `rounded-full` (pills, badges).
- Button height: `h-9` (small), `h-10` (default), `h-12` (large/CTA).
- Button padding: `px-4` (small), `px-6` (default), `px-8` (CTA).
- Icon size alongside text: `h-4 w-4` inline, `h-5 w-5` standalone.
- Touch targets: minimum 44×44px for all interactive elements on mobile.

---

## Interactive States

### Buttons
- Primary: `bg-primary text-primary-foreground` + `hover:bg-primary/90` + `transition-all`
- Secondary outline: `border border-primary/30 text-primary` + `hover:bg-primary/10 hover:border-primary`
- Ghost / subtle: `border border-white/15 text-muted-foreground` + `hover:border-white/30 hover:text-white`
- Destructive: `hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30`

### Animated CTA Buttons (landing page only)
- `.animate-throb-glow` — cyan primary
- `.animate-throb-glow-magenta` — fuchsia secondary
- `.animate-throb-glow-emerald` — emerald login
- **Use sparingly** — one per page section maximum. Never animate buttons inside the sidebar or app UI.

### Focus & Accessibility
- All interactive elements need a visible focus ring: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`
- Color is never the sole indicator of state — pair with icons or labels.

---

## Light Section Styles

When rendering on `section-light` (`background: #f8f9fb`):
- Headings: `text-[#0f1623]`
- Body: `text-[#4b5568]`
- Muted: `text-[#94a3b8]`
- Cards: white background, `border-slate-200`
- Step numbers / watermarks: `text-slate-100` (large, behind content)

Do not use dark-mode color tokens (`text-foreground`, `text-muted-foreground`) inside light sections — they will read incorrectly.

---

## Glow & Neon Effects

Use sparingly. Glow is the accent, not the default.

- `.neon-text` — text glow on primary-colored inline spans (hero h1 accent words)
- `.neon-border` — box shadow glow on primary CTAs
- Raw `shadow-[0_0_Xpx_hsl(var(--primary)/Y)]` — custom glow on cards and buttons

**Maximum glow density per component**: one glow effect. Don't stack neon-text + neon-border + custom shadow on the same element.

---

## What Not To Do

- ❌ Orbitron on section headings, card titles, or labels
- ❌ All-dark pages with no tonal variation
- ❌ Flat cards with no border, shadow, or backdrop
- ❌ `rounded-md` on content cards (too sharp, feels dated)
- ❌ Raw hex colors in JSX — use token classes
- ❌ `font-display tracking-wider` on h2–h6 (the CSS base rule was removed; apply only where needed)
- ❌ Multiple animated glow buttons in the same viewport
- ❌ `bg-gradient-to-*` — use `bg-linear-to-*` (Tailwind v4)

# UI Context

## Theme

Light mode only. No dark mode in the app UI (the dark variant is defined in `index.css` for shadcn/ui compatibility but is never toggled). The visual language is a clean, modern developer tool: white and soft slate backgrounds, strong blue accents, and generous use of soft shadows and rounded corners.

## Colors

Defined as CSS custom properties in `client/src/index.css` via `@theme inline` and `:root`. Components use Tailwind utility classes that map to these variables — no raw hex values in JSX except for the single brand blue `#1d4ed8` used for primary buttons.

| Role              | Value / Variable           | Usage                                        |
| ----------------- | -------------------------- | -------------------------------------------- |
| Page background   | `white` / `bg-white`       | Landing, dashboard, all pages                |
| Surface           | `slate-50` / `bg-slate-50` | Cards, filter bars, stat panels              |
| Border            | `slate-200`                | Dividers, card outlines                      |
| Primary text      | `slate-900`                | Headings and body copy                       |
| Secondary text    | `slate-600`                | Subheadings and descriptions                 |
| Muted text        | `slate-400`                | Labels, placeholders, meta info              |
| Brand blue        | `#1d4ed8` / `--primary`    | Primary CTA buttons, active tabs, accent bar |
| Sky blue          | `sky-600`                  | Secondary accent (Private repo stat)         |
| Active/success    | `blue-700`                 | Active repos, success log entries            |
| Error/failed      | `rose-500` / `rose-600`    | Failed log entries, error states             |
| In-progress       | `sky-700`                  | Ongoing log entries                          |
| Skipped           | `amber-700`                | Skipped log entries                          |
| Warning           | `amber-500`                | Notification banners (plan limit)            |

## Typography

| Role        | Font            | Source                                  |
| ----------- | --------------- | --------------------------------------- |
| Body / UI   | Geist Variable  | `@fontsource-variable/geist` via CSS    |
| Headings    | same as body    | `--font-heading: var(--font-sans)`      |
| Fallback    | Inter, system   | `--font-sans` initial declaration       |
| Mono labels | Tailwind `font-mono` | Used for uppercase section labels  |

Fonts are loaded via `@import "@fontsource-variable/geist"` in `index.css` and applied globally via `@theme inline`. Antialiasing is applied globally (`-webkit-font-smoothing: antialiased`).

## Border Radius

Uses a graduated scale. Smaller for inline interactive elements, larger for cards and page containers.

| Context                      | Class / Value         |
| ---------------------------- | --------------------- |
| Buttons, tabs, badges        | `rounded-xl`          |
| Stat cards, filter bars      | `rounded-2xl`         |
| Main content cards           | `rounded-[2rem]`      |
| Full-page overlays / modals  | `rounded-3xl`         |

## Shadows

Cards and panels use directional drop shadows to create depth on the white background. The pattern throughout the codebase is:

```
shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)]
```

Glow variants are used on log status cards (e.g. `shadow-[0_0_12px_-2px_rgba(29,78,216,0.16)]`).

## Animations

Framer Motion handles all page entry animations and component transitions.

- Page entry: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` with `duration: 0.4–0.6`.
- List stagger: `delay: Math.min(index * 0.03, 0.3)` on paginated repo cards.
- Notification banners use `AnimatePresence` for mount/unmount transitions.
- Buttons use `whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}`.

Custom CSS animation classes are defined in `index.css` for decorative elements on the landing page:

| Class                    | Effect                        |
| ------------------------ | ----------------------------- |
| `animate-float`          | Slow vertical float (6s)      |
| `animate-float-slow`     | Very slow float (12s)         |
| `animate-float-slow-delayed` | Same, 6s delay            |
| `animate-ping-slow`      | Slow ping ring pulse          |
| `animate-pulse-slow`     | Slow opacity pulse            |

## Icons

Lucide React for all functional icons. Stroke-based only.

- `h-4 w-4` — inline contextual icons (inside labels, badges)
- `h-5 w-5` — button icons
- `size={16}–{20}` — explicit size prop in most components
- `size={48}–{64}` — empty-state feature icons

Animated icons from `components/animate-ui/icons/` (custom animated variants of Lucide icons) are used on the landing Hero and How It Works sections.

## Layout Patterns

### Landing Page
Full-width sections: `LandingNavigation` → `Hero` → `Features` → `Footer`. White background with `hero-gradient` radial overlay behind the Hero. Language logo icons float decoratively on both sides of the hero.

### Dashboard (Home, Logs, Profile, Upgrade)
- Top navigation bar: `AuthNavigation` fixed at the top.
- Content starts at `pt-22–pt-24` to clear the nav.
- Max width `max-w-7xl` centered with `px-4 sm:px-6`.
- Gradient background: `bg-linear-to-b from-white via-slate-50/70 to-white`.
- Decorative blur blobs (`blur-3xl`) positioned absolutely for visual depth.

### Repo Grid
- Responsive: 1 col mobile → 2 col md → 3 col lg.
- Gap `gap-4 sm:gap-5 lg:gap-6`.
- Pagination bar below the grid.

### Modals and Overlays
- Walkthrough modal: centered overlay with `rounded-3xl`, white card, dark backdrop.
- Notification banners: full-width top bar with amber border and background.

## Component Library

shadcn/ui installed on top of Tailwind v4. Components live in `client/src/components/ui/`. Use the `shadcn` CLI to add new components — do not write them from scratch.

Base UI (`@base-ui/react`) is also a dependency for headless primitives.

## Tailwind Version

Tailwind CSS v4 is used. The configuration is entirely through `index.css` (`@theme`, `@custom-variant`, `@layer base`) — there is no `tailwind.config.js`. Do not create one. Use CSS-based configuration only.

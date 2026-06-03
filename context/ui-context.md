# UI Context

## Design Philosophy

- Clean, minimal, functional — not flashy
- Non-technical users must understand what to do without instructions
- Mobile-first: every screen is designed for 380px first, then desktop
- Dark mode supported via Tailwind `dark:` variants throughout
- No external UI library (no shadcn, no MUI) — components are hand-built
  using `@studio/ui` primitives + Tailwind

## Fonts

- Font family: Inter (next/font/google)
- Mono font: system mono stack for hex codes and code blocks
- Font sizes follow Tailwind defaults (text-xs through text-2xl)

## Colour Tokens (Tailwind classes, not hardcoded hex)

### Brand colours (studio-wide)
- Primary action: `bg-violet-600` / `text-violet-600` (#7C3AED)
- Primary hover: `bg-violet-700`
- Success: `bg-emerald-600` / `text-emerald-600`
- Danger / error: `bg-red-500` / `text-red-600`
- Warning: `bg-amber-500` / `text-amber-600`

### Neutral surfaces (light mode)
- Page background: `bg-white` or `bg-gray-50`
- Card / panel: `bg-white` with `border border-gray-200`
- Input background: `bg-white` with `border border-gray-300`
- Secondary surface: `bg-gray-50`
- Muted text: `text-gray-500`
- Body text: `text-gray-900`

### Neutral surfaces (dark mode)
- Page background: `dark:bg-gray-950`
- Card / panel: `dark:bg-gray-900` with `dark:border-gray-800`
- Input background: `dark:bg-gray-900` with `dark:border-gray-700`
- Muted text: `dark:text-gray-400`
- Body text: `dark:text-gray-50`

## Component Conventions

### Button variants
- `primary`: `bg-violet-600 text-white hover:bg-violet-700`
- `ghost`: `border border-gray-200 text-gray-700 hover:bg-gray-50`
- `pill`: `rounded-full border` — used for model toggle and filters
- All buttons: `transition-colors duration-150`, `focus-visible:ring-2`
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: replace children with `<Loader2 className="animate-spin" />`

### PillChip (tone, use case, audience selectors)
- Unselected: `border border-gray-200 text-gray-600 bg-white`
- Selected: `bg-violet-600 text-white border-violet-600`
- Hover unselected: `hover:border-gray-400`
- Role: `radiogroup` on container, `radio` on each chip
- Keyboard: arrow keys navigate, Enter/Space selects

### Cards (AppCard on root site)
- `rounded-xl border border-gray-200 bg-white p-5`
- Hover: `hover:border-gray-400 transition-colors`
- Dark: `dark:bg-gray-900 dark:border-gray-800`

### Input / Textarea
- `w-full rounded-lg border border-gray-300 px-3 py-2 text-sm`
- Focus: `focus:outline-none focus:ring-2 focus:ring-violet-500`
- Dark: `dark:bg-gray-900 dark:border-gray-700 dark:text-gray-50`

### Skeleton loading
- `animate-pulse bg-gray-200 rounded-lg dark:bg-gray-800`
- Match the exact dimensions of the content being replaced
- Never use a spinner — always use skeletons for content areas

### Error state
- `AlertCircle` icon from lucide-react in `text-red-500`
- Message in `text-gray-600 dark:text-gray-400`
- Retry button using `ghost` variant

## PaletteAI-Specific UI

### BannerStrip
- Full-width flex row of colour segments
- Each segment: `flex: 1`, on hover: `flex: 2` (CSS `transition: flex 0.2s`)
- Height: `h-11` (44px) on mobile, `h-14` (56px) on desktop
- Selected segment: `outline outline-2 outline-offset-[-2px] outline-gray-900`
- Cursor: `cursor-pointer` on each segment

### SwatchCard (desktop)
- Colour block: `h-20` (80px) on desktop, `h-16` (64px) in scroll cards
- Border radius: `rounded-xl` on the card, inner colour block has no radius
- Name: `text-sm font-medium`
- Hex: `text-xs font-mono text-gray-500`
- Usage badge: `text-[10px] uppercase tracking-wider`

### LabelList (mobile, 5 colours)
- Each row: `flex items-center gap-3 p-3 rounded-lg border`
- Colour dot: `w-6 h-6 rounded-md flex-shrink-0`
- Selected: `border-violet-500 bg-violet-50 dark:bg-violet-950/20`
- WCAG badge: `text-[10px] rounded-full px-1.5 py-0.5`
  - Pass: `bg-emerald-100 text-emerald-800`
  - Fail: `bg-red-100 text-red-700`

### ScrollCards (mobile, 8 colours)
- Container: `flex gap-2 overflow-x-auto scroll-snap-x-mandatory pb-2`
- Custom scrollbar: `scrollbar-thin scrollbar-thumb-gray-300`
- Each card: `flex-none w-28 rounded-xl border scroll-snap-align-start`
- Selected card: `border-violet-500 border-[1.5px]`

### DetailPanel
- Appears below swatches on selection, no modal
- Animate: `max-height 0 → auto` with `transition-all duration-200`
- Colour swatch preview: `w-10 h-10 rounded-lg`
- Rows: label in `text-xs text-gray-500`, value in `text-xs font-mono`

### ExportPanel tabs
- Tab bar: `flex gap-1 mb-3`
- Active tab: `bg-violet-100 text-violet-800 dark:bg-violet-900/30`
- Code block: `font-mono text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg`

### LivePreview
- Fake UI that uses the 5 palette colours directly via inline styles
- Not Tailwind colours — always `style={{ background: colour.hex }}`
- Layout modes: card, dashboard, landing (toggle buttons above preview)
- Smooth transition when palette changes: `transition-colors duration-300`

## Layout Breakpoints

- Mobile: default (0px+) — single column
- md (768px+): two-column layout on PaletteAI (input left, results right)
- Input panel: `w-full md:w-[380px] flex-shrink-0`
- Results panel: `flex-1 min-w-0`

## Spacing System

- Component internal padding: `p-4` or `p-5`
- Gap between sections: `gap-4` or `gap-6`
- Gap between chips: `gap-2`
- Section labels: `text-xs font-medium uppercase tracking-widest text-gray-400 mb-2`

## Animation

- Swatch stagger: `opacity-0 → opacity-100` + `translateY(8px) → 0`
  delay per item: `index * 60ms` via inline `style={{ animationDelay }}`
- All transitions use `duration-150` or `duration-200` — never longer
- No third-party animation library — CSS and Tailwind only

## Accessibility Rules

- All interactive elements: visible `focus-visible:ring-2 focus-visible:ring-violet-500`
- Chip groups: `role="radiogroup"` container, `role="radio"` per chip
- Icon-only buttons: `aria-label` always present
- Colour swatches: `aria-label="{name}, {hex}"` on each
- Loading states: `aria-live="polite"` region announces generation status
- Contrast: auto-computed at render using `getTextColour(hex)` from
  `@studio/utils` — never hardcode white or black text on coloured surfaces

# PaletteAI Phase 2 — Feature Spec: Shareable URL

> Standalone spec. Feed this entire file to Claude as a single prompt after
> Phase 1 (Sections 01–09) is complete and deployed.
> Branch off `develop` before starting.

---

## Goal

Every generated palette produces a unique URL that fully encodes the palette
state. Anyone with the URL can open it and see the exact palette — no API
call, no server, no database. A Share button in the topbar copies the URL
and confirms with a "Link copied!" toast.

---

## Context

`encodeState` and `decodeState` already exist in `@studio/utils/src/urlState.ts`.
They use `btoa`/`atob` + JSON. No new utility code is needed.

The `AppShell` component already has an `actions?: React.ReactNode` slot in
the topbar (added in Section 07). The Share button goes there.

`app/page.tsx` already reads and writes the URL hash for palette restoration
(Section 07). This spec adds the explicit Share button and toast on top of
that existing wiring.

---

## GitHub Commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/palette-ai-shareable-url
```

---

## Files to Create

```
apps/palette-ai/components/ShareToast.tsx
```

---

## Files to Modify

```
apps/palette-ai/app/page.tsx
```

---

## Prompt for Claude

```
Using the monorepo context for apps/palette-ai, implement the shareable URL
feature. All utility functions already exist — this is wiring and UI only.

---

### File 1 — apps/palette-ai/components/ShareToast.tsx (create)

"use client" directive required.

Props interface ShareToastProps:
  visible: boolean

Renders a toast notification that says "Link copied!" with a small
lucide Link icon to its left.

Positioning:
- Fixed to the bottom-center of the viewport
- `fixed bottom-6 left-1/2 -translate-x-1/2`
- `z-50`

Appearance:
- `bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900`
- `px-4 py-2 rounded-full text-sm font-medium`
- `flex items-center gap-2`
- `shadow-lg`

Visibility animation:
- Use CSS transitions, not JS animation libraries
- When visible=true: `opacity-100 translate-y-0`
- When visible=false: `opacity-0 translate-y-2 pointer-events-none`
- Transition: `transition-all duration-200`
- Start invisible (translate-y-2 opacity-0) so it slides up into view

Accessibility:
- `role="status"` on the root element
- `aria-live="polite"` on the root element
- `aria-hidden={!visible}` on the root element

Do not use position:fixed as an inline style — use only Tailwind classes.
Export the component as a named export.

---

### File 2 — apps/palette-ai/app/page.tsx (modify)

This file already exists. Make the following targeted changes — do not
rewrite the whole file.

#### 2a — Share button state

Add `const [shareVisible, setShareVisible] = useState(false)` near the
other state declarations.

Add a handleShare function:

  function handleShare(): void {
    void navigator.clipboard.writeText(window.location.href)
    setShareVisible(true)
    setTimeout(() => setShareVisible(false), 2000)
  }

#### 2b — URL hash encoding on generation

After addToHistory(newPalette) (the line that saves to history after a
successful generation), add:

  window.location.hash = encodeState(newPalette)

encodeState is already imported from @studio/utils.

#### 2c — URL hash decoding on mount

The useEffect that reads the URL hash on mount already exists from Section 07.
Confirm it uses this pattern:

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const restored = decodeState<Palette>(hash)
    if (restored) setActivePalette(restored)
  }, [])

If already present and correct, leave it unchanged. If missing or different,
add or correct it.

#### 2d — Share button in AppShell actions slot

Import ShareToast from ./components/ShareToast (relative).
Import Share2 from lucide-react.

Pass the Share button as the actions prop to AppShell:

  actions={
    <button
      onClick={handleShare}
      aria-label="Copy shareable link"
      className="flex items-center gap-1.5 text-sm text-gray-500
                 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50
                 transition-colors focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden sm:inline">Share</span>
    </button>
  }

#### 2e — Render the toast

Place <ShareToast visible={shareVisible} /> as the last child inside the
outermost JSX wrapper of the page component. It is position:fixed so its
DOM position does not affect its visual placement.

---

Do not add any other changes. Do not alter any existing logic.
Generate the complete file contents for ShareToast.tsx.
For page.tsx, output the exact additions as targeted diffs or inline
instructions — do not rewrite the entire file unless asked.
```

---

## Checkpoint

```bash
cd apps/palette-ai
pnpm dev
# Open localhost:3001

# Verify — shareable URL:
# 1. Generate a palette with any mood.
# 2. Check the browser address bar — the URL hash updates immediately
#    e.g. http://localhost:3001/#eyJpZCI6Ii4u...
# 3. Copy the full URL. Open a new tab. Paste and navigate.
#    The palette restores without any API call (no loading skeleton).
# 4. DevTools → Network — confirm zero requests to /api/generate on page load.

# Verify — Share button:
# 5. Click the Share button in the topbar.
# 6. "Link copied!" toast appears at bottom-center, slides up,
#    stays for ~2 seconds, then fades out.
# 7. Paste clipboard contents — should be the full URL with hash.

# Verify — accessibility:
# 8. Tab to the Share button — visible focus ring must appear.
# 9. VoiceOver or axe — toast must be announced as "Link copied!".

# Verify — empty state:
# 10. Load localhost:3001 with no hash.
#     No palette is restored; MoodInput shows in its default state.

# Run unit tests to confirm urlState round-trips still pass:
pnpm test

git add apps/palette-ai/components/ShareToast.tsx apps/palette-ai/app/page.tsx
git commit -m "feat: shareable URL with Share button and Link copied toast"
git push origin feat/palette-ai-shareable-url
```

---

## PR Command

```bash
gh pr create \
  --base develop \
  --title "feat: shareable palette URL with Share button" \
  --body "$(cat <<'EOF'
## Summary
- Encodes full Palette object as base64 in URL hash on every generation
- On load, decodes hash and restores palette without an API call
- Share button in topbar copies full URL to clipboard
- 'Link copied!' toast appears for 2 seconds at bottom-center with slide-up animation

## Test plan
- [ ] Generate palette — URL hash updates in address bar
- [ ] Copy URL, open new tab, paste — palette restores, zero /api/generate requests
- [ ] Share button triggers 2-second toast then dismisses
- [ ] Tab to Share button shows visible focus ring
- [ ] Toast announced by screen reader via aria-live
- [ ] pnpm test passes — urlState round-trips unchanged
EOF
)"
```

# PaletteAI Phase 2 — Feature Spec: Image Upload

> Standalone spec. Feed this entire file to Claude as a single prompt after
> Phase 1 (Sections 01–09) is complete and deployed.
> Branch off `develop` before starting.
> Do not combine with other Phase 2 branches.

---

## Goal

A user can upload a photo (or take one on mobile) and receive a colour
palette extracted from that image. The image is sent to whichever AI
provider the ModelToggle is set to — Claude or Gemini — following the same
Strategy pattern used by the text generation flow. The existing `parseColours`
parser handles the response unchanged. A thumbnail of the uploaded image
appears in the input panel while generating so the user knows their image
was received.

---

## Context

- `parseColours` in `apps/palette-ai/lib/parseColours.ts` already handles
  the AI response — no changes needed there.
- `checkRateLimit` from `@studio/ai-core` must be called in the new route,
  identical to the existing `/api/generate` route.
- Both `claudeVisionProvider` and `geminiVisionProvider` go in
  `packages/ai-core/src/`. They are server-side only and must never be
  imported in client components or hooks.
- A new `VisionProviderFn` type is added to `@studio/ai-core/src/types.ts`
  alongside the existing `ProviderFn`:
    `type VisionProviderFn = (prompt: string, imageBase64: string, mimeType: ImageMimeType) => Promise<string>`
  where `ImageMimeType = "image/jpeg" | "image/png" | "image/webp"`.
- The route `/api/generate-from-image` accepts a `model` field and routes to
  the correct vision provider using the same Strategy pattern as the text
  route. Adding a third vision provider in the future = one new file +
  one branch in the router.
- `MoodInput` already holds model state internally. The `onGenerateFromImage`
  callback receives model as a third argument so it flows through to the API
  call and is recorded on the saved `Palette` object correctly.
- Only the `count` and `model` fields from `PaletteOptions` are used
  (tone, useCase, audience, theme are irrelevant for image-derived palettes).
- Accepted image types: `image/jpeg`, `image/png`, `image/webp`.
  Max file size: 5 MB. Validate both in the component (before sending) and
  in the API route (after receiving).

---

## Provider Strategy Diagram

```
/api/generate-from-image/route.ts
  └── routes on model field
        ├── claudeVisionProvider(prompt, imageBase64, mimeType)
        │     └── @anthropic-ai/sdk  messages.create with image content block
        ├── geminiVisionProvider(prompt, imageBase64, mimeType)
        │     └── @google/generative-ai  generateContent with inlineData block
        └── parseColours(raw, count)   ← unchanged, shared output parser
```

---

## GitHub Commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/palette-ai-image-upload
```

---

## Files to Create

```
packages/ai-core/src/claudeVisionProvider.ts
packages/ai-core/src/geminiVisionProvider.ts
apps/palette-ai/app/api/generate-from-image/route.ts
```

---

## Files to Modify

```
packages/ai-core/src/types.ts          (add VisionProviderFn, ImageMimeType)
packages/ai-core/src/index.ts          (export both vision providers + new types)
apps/palette-ai/components/MoodInput.tsx
apps/palette-ai/hooks/usePalette.ts
```

---

## Prompt for Claude

```
Using the monorepo context, implement the image upload feature for
apps/palette-ai. Read the full context before generating any file.

---

### File 1 — packages/ai-core/src/types.ts (modify)

Add two new exports alongside the existing AIModel, ProviderFn, and
RateLimitResult. Do not remove or change any existing types.

  type ImageMimeType = "image/jpeg" | "image/png" | "image/webp"

  type VisionProviderFn = (
    prompt: string,
    imageBase64: string,
    mimeType: ImageMimeType
  ) => Promise<string>

---

### File 2 — packages/ai-core/src/claudeVisionProvider.ts (create)

Server-side only. Never import this in a client component or hook.

Imports:
  import Anthropic from "@anthropic-ai/sdk"
  import type { ImageMimeType } from "./types"

Function signature matches VisionProviderFn:
  export async function claudeVisionProvider(
    prompt: string,
    imageBase64: string,
    mimeType: ImageMimeType
  ): Promise<string>

Implementation:
- Create an Anthropic client inside the function body (not at module level):
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
- Call client.messages.create with:
    model: "claude-haiku-4-5-20251001"
    max_tokens: 600
    messages: one user message with content as an array of two blocks:
      1. An image block:
           { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } }
      2. A text block:
           { type: "text", text: prompt }
- Extract the text from the first content block of the response
- Return the raw string (caller handles parsing)
- Wrap in try/catch; re-throw as new Error("PROVIDER_FAILED")

---

### File 3 — packages/ai-core/src/geminiVisionProvider.ts (create)

Server-side only. Never import this in a client component or hook.

Imports:
  import { GoogleGenerativeAI } from "@google/generative-ai"
  import type { ImageMimeType } from "./types"

Function signature matches VisionProviderFn:
  export async function geminiVisionProvider(
    prompt: string,
    imageBase64: string,
    mimeType: ImageMimeType
  ): Promise<string>

Implementation:
- Create the client inside the function body (not at module level):
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "")
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
- Call model.generateContent with an array of two parts:
    1. An inline data part:
         { inlineData: { mimeType, data: imageBase64 } }
    2. A text part (plain string):
         prompt
- Return result.response.text()
- Wrap in try/catch; re-throw as new Error("PROVIDER_FAILED")

---

### File 4 — packages/ai-core/src/index.ts (modify)

Add four new exports. Do not change any existing exports.

  export { claudeVisionProvider } from "./claudeVisionProvider"
  export { geminiVisionProvider } from "./geminiVisionProvider"
  export type { ImageMimeType, VisionProviderFn } from "./types"

---

### File 5 — apps/palette-ai/app/api/generate-from-image/route.ts (create)

Next.js App Router POST route handler. Server-side only.

Imports (in order):
  import { checkRateLimit, claudeVisionProvider, geminiVisionProvider } from "@studio/ai-core"
  import type { VisionProviderFn, ImageMimeType } from "@studio/ai-core"
  import { parseColours } from "../../../lib/parseColours"
  import type { Colour } from "../../../lib/types"

Request body type (define before using):
  interface GenerateFromImageBody {
    imageBase64: string
    mimeType: ImageMimeType
    count: 3 | 5 | 6 | 8
    model: "claude" | "gemini"
  }

Implementation steps (in this order):

1. Read IP from x-forwarded-for header, fall back to "unknown".

2. Call checkRateLimit(ip). If not allowed, return:
     Response.json({ error: "Rate limit exceeded", waitSeconds }, { status: 429 })

3. Parse request body with request.json(). Wrap in try/catch — if it throws,
   return 400 { error: "Invalid request body" }.

4. Validate each field explicitly. Return 400 with a specific error message
   for each failure:
   - imageBase64: must be a non-empty string. Max length 6,972,000 characters
     (approx 5 MB in base64). If exceeded:
       { error: "Image too large. Maximum size is 5 MB." }
   - mimeType: must be exactly "image/jpeg", "image/png", or "image/webp".
   - count: must be exactly 3, 5, 6, or 8 (number).
   - model: must be "claude" or "gemini".

5. Route to the correct vision provider using the Strategy pattern:
     const visionProvider: VisionProviderFn =
       model === "claude" ? claudeVisionProvider : geminiVisionProvider

6. Build the vision prompt:
     const prompt = `Extract exactly ${count} colours from this image.
   Return ONLY a JSON array. Each item must have these fields:
   - hex: a valid 6-digit hex colour e.g. "#a3b4c5"
   - name: a short descriptive colour name
   - usage: one of "background" | "surface" | "primary" | "accent" | "text" | "card" | "sidebar" | "highlight" | "success"
   - rationale: one sentence explaining why this colour appears in the image

   Respond with ONLY the JSON array. No markdown. No explanation. No fences.`

7. Use AbortController with a 15-second timeout:
     const controller = new AbortController()
     const timeout = setTimeout(() => controller.abort(), 15000)

8. Call visionProvider(prompt, imageBase64, mimeType).
   Clear the timeout after the call.

9. Call parseColours(raw, count).
   On PARSE_FAILED error: retry once by calling visionProvider again with
   the same image arguments but append to the prompt:
     "IMPORTANT: Return ONLY the JSON array. No other text whatsoever."
   If the retry also throws PARSE_FAILED, return:
     Response.json({ error: "Model returned unparseable response" }, { status: 502 })

10. Return 200:
      Response.json({ colours: parsedColours })

11. Wrap the entire handler body in try/catch. On abort, return 504.
    On any other error, log error.constructor.name (not the message) and
    return 503.

Never log imageBase64, request bodies, or API keys.

---

### File 6 — apps/palette-ai/hooks/usePalette.ts (modify)

This file already exists. Add one new function alongside the existing
generate function. Do not change generate or any existing state.

Change the generateFromImage signature to accept model as a third argument:

  async function generateFromImage(
    file: File,
    count: 3 | 5 | 6 | 8,
    model: AIModel
  ): Promise<void> {
    if (cooldown > 0) return
    setIsLoading(true)
    setError(null)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    await new Promise<void>((resolve, reject) => {
      reader.onload = () => resolve()
      reader.onerror = () => reject(reader.error)
    })

    const dataUrl = reader.result as string
    const [meta, imageBase64] = dataUrl.split(",")
    const mimeType = meta.split(":")[1].split(";")[0] as ImageMimeType

    try {
      const res = await fetch("/api/generate-from-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType, count, model }),
      })

      if (res.status === 429) {
        const data = await res.json() as { error: string; waitSeconds: number }
        setError(data.error)
        setCooldown(data.waitSeconds)
        return
      }

      if (!res.ok) {
        const data = await res.json() as { error: string }
        setError(data.error ?? "Something went wrong.")
        return
      }

      const data = await res.json() as { colours: Colour[] }
      const newPalette: Palette = {
        id: crypto.randomUUID(),
        mood: "from image",
        colours: data.colours,
        model,
        createdAt: Date.now(),
      }
      setPalette(newPalette)
      startCooldown()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

Import AIModel from @studio/ai-core (re-export via lib/providers/types.ts).
Import ImageMimeType from @studio/ai-core.
Import Colour and Palette from ../lib/types if not already imported.
Add generateFromImage to the hook's return value.

---

### File 7 — apps/palette-ai/components/MoodInput.tsx (modify)

This file already exists. Make targeted additions only.

#### 7a — Props update

Update the MoodInputProps interface — change the onGenerateFromImage
signature to include model:
  onGenerateFromImage: (file: File, count: 3 | 5 | 6 | 8, model: AIModel) => void

Import AIModel from @studio/ai-core (or via lib/providers/types.ts).

#### 7b — Image state

Add inside the component function:
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

Import useRef from react if not already imported.

#### 7c — File handler

Add this handler. It reads model from the component's existing model state:
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return

    const ACCEPTED = ["image/jpeg", "image/png", "image/webp"]
    if (!ACCEPTED.includes(file.type)) return
    if (file.size > 5 * 1024 * 1024) return

    const url = URL.createObjectURL(file)
    setImagePreview(url)
    onGenerateFromImage(file, count, model)
  }

model and count are already in local state in this component.

#### 7d — File input and upload button

Place these two elements in the MoodInput layout immediately below the
mood textarea, before the tone chip section:

Hidden file input:
  <input
    ref={fileInputRef}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className="sr-only"
    onChange={handleFileChange}
    aria-label="Upload image for palette generation"
  />

Upload button that triggers the hidden input:
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    aria-label="Upload image"
    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900
               dark:text-gray-400 dark:hover:text-gray-50 transition-colors
               focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-violet-500 rounded px-2 py-1 border
               border-gray-200 dark:border-gray-700 hover:border-gray-400"
  >
    <ImageIcon className="w-4 h-4" />
    <span>Use image</span>
  </button>

Import ImageIcon from lucide-react.

#### 7e — Image thumbnail preview

Place this block directly below the upload button.
Only renders when imagePreview is not null AND isLoading is true:

  {imagePreview && isLoading && (
    <div className="flex items-center gap-2 mt-2">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden
                      border border-gray-200 dark:border-gray-700 flex-shrink-0">
        <img
          src={imagePreview}
          alt="Uploaded image preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center
                        justify-center">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Extracting palette from image…
      </span>
    </div>
  )}

Import Loader2 from lucide-react if not already imported.

When isLoading becomes false the thumbnail disappears automatically
because the condition requires isLoading=true.

---

Do not generate placeholder comments. Every file must be complete and
compilable with strict TypeScript. Never use any types.
```

---

## Checkpoint

```bash
cd apps/palette-ai
pnpm dev
# Open localhost:3001

# Verify — Claude vision happy path:
# 1. Set ModelToggle to Claude.
# 2. Click "Use image" button in MoodInput.
# 3. Select a JPEG, PNG, or WEBP photo.
# 4. Thumbnail appears with spinner and "Extracting palette from image…"
# 5. Swatches render with colours extracted from the photo.
# 6. Thumbnail disappears. History entry shows claude badge.

# Verify — Gemini vision happy path:
# 7. Set ModelToggle to Gemini.
# 8. Upload a different photo.
# 9. Same flow — thumbnail, spinner, swatches render.
# 10. History entry shows gemini badge.

# Verify — count selector:
# 11. Change count to 8, upload an image with Claude selected.
#     Confirm 8 swatches are returned.
# 12. Change count to 3, upload with Gemini selected.
#     Confirm 3 swatches are returned.

# Verify — file guards:
# 13. Attempt to select a .gif or .pdf — rejected by the accept attribute
#     or silently ignored by the handler.
# 14. Attempt to upload a file larger than 5 MB — handler returns early,
#     no API call is made.

# Verify — API route directly (Claude):
curl -X POST http://localhost:3001/api/generate-from-image \
  -H "Content-Type: application/json" \
  -d "{\"imageBase64\":\"$(base64 -i /path/to/test.jpg)\",\"mimeType\":\"image/jpeg\",\"count\":5,\"model\":\"claude\"}"
# Should return { colours: [...] } with 5 items

# Verify — API route directly (Gemini):
curl -X POST http://localhost:3001/api/generate-from-image \
  -H "Content-Type: application/json" \
  -d "{\"imageBase64\":\"$(base64 -i /path/to/test.jpg)\",\"mimeType\":\"image/jpeg\",\"count\":5,\"model\":\"gemini\"}"
# Should return { colours: [...] } with 5 items

# Verify — model validation:
curl -X POST http://localhost:3001/api/generate-from-image \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"abc","mimeType":"image/jpeg","count":5,"model":"openai"}'
# Should return 400 { error: "model: must be claude or gemini" }

# Build check:
pnpm build --filter=@studio/palette-ai
# Must compile without TypeScript errors

# Unit tests:
pnpm test
# All existing tests must still pass

git add \
  packages/ai-core/src/types.ts \
  packages/ai-core/src/claudeVisionProvider.ts \
  packages/ai-core/src/geminiVisionProvider.ts \
  packages/ai-core/src/index.ts \
  apps/palette-ai/app/api/generate-from-image/route.ts \
  apps/palette-ai/hooks/usePalette.ts \
  apps/palette-ai/components/MoodInput.tsx
git commit -m "feat: image upload — extract palette from photo via Claude or Gemini vision"
git push origin feat/palette-ai-image-upload
```

---

## PR Command

```bash
gh pr create \
  --base develop \
  --title "feat: extract colour palette from uploaded image (Claude + Gemini)" \
  --body "$(cat <<'EOF'
## Summary
- Camera icon button in MoodInput opens file picker (JPEG/PNG/WEBP, max 5 MB)
- Uploaded image converts to base64 in the browser and is sent to /api/generate-from-image
- New route follows the same Strategy pattern as /api/generate — routes to claudeVisionProvider or geminiVisionProvider based on the model field
- claudeVisionProvider: Anthropic SDK messages.create with image content block
- geminiVisionProvider: Google GenAI generateContent with inlineData block
- VisionProviderFn and ImageMimeType types added to @studio/ai-core alongside ProviderFn
- Response parsed by existing parseColours unchanged; one retry on PARSE_FAILED
- Image thumbnail with spinner overlay shows while generating, disappears on completion
- Palette.model reflects whichever provider was used (not hardcoded to claude)
- Count selector (3/5/6/8) and ModelToggle both apply to image-derived palettes

## Test plan
- [ ] Claude + JPEG — palette extracted, history badge shows claude
- [ ] Gemini + PNG — palette extracted, history badge shows gemini
- [ ] Count selector affects number of returned colours for both providers
- [ ] File > 5 MB silently rejected before sending
- [ ] Non-image file types rejected by accept attribute
- [ ] model: "openai" returns 400
- [ ] /api/generate-from-image returns 429 when rate limited
- [ ] pnpm build passes with no TypeScript errors
- [ ] pnpm test passes — existing tests unaffected
EOF
)"
```

# Frontend Documentation — Auto-SDK Architect

**Audience:** Frontend team
**Backend status:** 4 routes live (see §2)
**Scope:** v1 UI — submit URL, watch pipeline, download SDK

---

## 1. Product Overview

The user pastes an API docs URL. The system generates a typed Python SDK in ~90 seconds. The UI has exactly **two screens**:

1. **Home** — one input (URL), one button (Generate).
2. **Job** — live Scratchpad feed + download button when ready.

There is **no** chat, no login, no settings, no history list in v1. Keep it to two screens.

---

## 2. Backend Contract (already implemented)

Base URL (dev): `http://127.0.0.1:8000`

### `POST /generate`
**Request body:**
```json
{ "url": "https://docs.example.com/api" }
```
**Response:** `202 Accepted`
```json
{ "job_id": "94839d87-76b6-4dbb-b8e0-44802d43f231" }
```
**Errors:**
- `422` — URL missing or malformed (`url` must be a valid `http`/`https` URL).

### `GET /jobs/{job_id}`
**Response:** `200`
```json
{
  "job_id": "94839d87-...",
  "status": "pending" | "running" | "success" | "failed",
  "sdk_url": null | "/jobs/94839d87-.../sdk",
  "scratchpad": [
    {
      "step": 1,
      "node": "ScraperNode",
      "event": "scrape.complete",
      "ts": "2026-11-11T07:49:38.619848+00:00",
      "payload": { "bytes": 98961 }
    }
  ]
}
```
**Errors:**
- `404` — unknown job id (also happens in the first ~50ms after submit, before the background task writes its first checkpoint — **poll until 200**).

### `GET /jobs/{job_id}/sdk`
**Response:** `200`, `Content-Type: text/x-python`, `Content-Disposition: attachment; filename="<job_id>_sdk.py"`
**Errors:**
- `404` — unknown job
- `409` — job not yet `success` (SDK not ready)

### `GET /health`
Not used by the UI. For ops only.

---

## 3. Route Map

| Path | Page | Purpose |
|---|---|---|
| `/` | `HomePage` | URL form + submit |
| `/jobs/:jobId` | `JobPage` | Poll job, render Scratchpad, download |
| `*` | `NotFound` | 404 |

**No other routes in v1.** Do not add `/jobs` (list), `/settings`, `/login`, or `/history` — none are backed by an API.

---

## 4. Navigation Flow (onSubmit)

```
HomePage
  └─ user types URL
  └─ user clicks Generate (or presses Enter)
       └─ e.preventDefault()                 ← see §5
       └─ POST /generate { url }
       └─ 202 → { job_id }
       └─ navigate(`/jobs/${job_id}`)         ← SPA nav via useNavigate
JobPage
  └─ reads :jobId via useParams
  └─ polls GET /jobs/:jobId every 1.5s
       └─ until status ∈ { success, failed }
  └─ on success → show Download button
       └─ <a href={`${BASE}/jobs/${jobId}/sdk`} download>
```

**Do not use `window.location.href` for the post-submit navigation.** It causes a full page reload, loses SPA state, and makes the "back" button behave wrong. Use `useNavigate` from `react-router-dom`.

The **download** button *may* use a plain `<a href>` — it's a file, and a native download is the right UX.

---

## 5. Where `preventDefault()` Is Required

**Exactly one place:** the URL submission form on `HomePage`.

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();      // ← required
  // ... POST /generate, navigate
}
```

**Why:** `<form>` with a `type="submit"` button defaults to a native GET submission — the browser reloads the page, React state is lost, and the user never sees `JobPage`. `preventDefault()` stops the native behavior; then the handler does the async submit and SPA navigation.

**Nowhere else needs `preventDefault()` in this UI.** There are no other forms, no `a` tags with `onClick` that need it, no drag-drop. Don't sprinkle it — one call, one place, documented.

**Enter key:** works automatically on `<form>` — the browser fires `submit` when the user presses Enter in the input. No extra `onKeyDown` needed. That's the point of using `<form>` instead of a bare input + button.

---

## 6. Params

**URL params:** one, `:jobId` on `/jobs/:jobId`.

Read it via `useParams`:

```tsx
const { jobId } = useParams<{ jobId: string }>();
```

- Type it `string` — React Router doesn't know it's a UUID.
- Guard against `undefined` (TS will warn): if `!jobId`, render an error or redirect.
- **Do not** parse it, validate it, or transform it. Pass it to the API as-is.

**Query params:** **none in v1.** Do not add `?url=...` on the job page, `?filter=...` on the feed, or any other query string. All state that matters (URL, status, scratchpad) comes from the backend.

**Body params:** the JSON body of `POST /generate` is `{ url: string }`. Nothing else. No `format`, no `model`, no `options` — the backend rejects extra fields only if you add strict validation, but the contract is **one field**.

---

## 7. Props & Prop Drilling

**The rule for v1: no prop drilling beyond one level.** If you find yourself passing a prop through a parent that doesn't use it, stop — either the component is in the wrong place, or the value belongs in a module-level constant.

### Legitimate prop passing

| From | To | Prop | Why it's fine |
|---|---|---|---|
| `JobPage` | `FeedLine` | `entry: ScratchpadEntry` | One level. `FeedLine` is pure presentation. |
| `JobPage` | `DownloadButton` (if extracted) | `jobId: string` | One level. |
| `HomePage` | `UrlForm` (if extracted) | `onSubmit: (url: string) => Promise<void>`, `submitting: boolean` | One level. |

### What is **not** a prop

- **API base URL** — lives in `src/api.ts` as a module constant (`BASE`). Never a prop. Never in context.
- **`jobId`** — read from the URL via `useParams()` in `JobPage`. Not passed from a parent.
- **Polling interval** — module constant (`POLL_MS = 1500`) in `JobPage`.
- **Backend status shape** — TypeScript types exported from `api.ts`. Imported where needed.

### If you're tempted to drill more than one level

Stop and ask: *"Does the intermediate component need this value?"*

- If **no** → the value belongs in `api.ts`, `useParams()`, or a module constant.
- If **yes** → it's a legit prop, but consider whether the intermediate component should be the one fetching.
- **Only use React Context** if you have ≥3 unrelated components needing the same global state. **v1 has zero such cases.** Do not add a Context provider "for later." Add it when the third consumer appears.

---

## 8. Component Breakdown

### `HomePage`
- Local state: `url: string`, `submitting: boolean`, `error: string | null`.
- `onSubmit`: `preventDefault` → `POST /generate` → `navigate('/jobs/{job_id}')`.
- Error rendering: `error` shown below the form; the form stays filled so the user can correct the URL.
- Input: `type="url"` (browser-level URL validation) + `required` + `disabled={submitting}`.
- Button: `type="submit"`, `disabled={submitting || !url}`, label `"Generate"` / `"Starting…"`.

### `JobPage`
- Reads `:jobId` via `useParams`.
- Local state: `job: JobStatus | null`, `error: string | null`.
- `useEffect` (deps `[jobId]`): start polling.
  - Poll every `1500ms`.
  - **Stop** when `status === 'success'` or `status === 'failed'`.
  - **Cleanup** on unmount: set a `cancelled` flag **and** `clearTimeout` — both. The flag prevents a stale response from setting state; the timeout prevents the loop from continuing.
  - On `404` during polling (job not yet written): **treat as `status: "pending"`** and keep polling. Do not show an error for the first 2–3 polls. (Alternative: swallow `404` for the first `~3s`, then surface.)
- Renders:
  - Status line.
  - Scratchpad list (`<FeedLine>` per entry, `key={entry.step}`).
  - When `success`: `<a href={`${BASE}/jobs/${jobId}/sdk`} download>` — plain link, no fetch, no blob.
  - When `failed`: error message; no download button.
  - When `running`/`pending`: "Pipeline running…" text.

### `FeedLine`
- Props: `entry: ScratchpadEntry` only.
- Renders: `[step] node event-rendered-text`.
- **One switch-equivalent map** from `event` → text-rendering function. That's the only place event names appear in the UI. Adding a new backend event = one line here.
- Unknown `event` → render raw `event` string. **Do not** crash on unknown events (backend may add new ones; the UI should degrade).

### `NotFound`
- Trivial: `404 — page not found` + a link back to `/`.

---

## 9. Polling Rules (important)

The backend has no WebSocket, no SSE, no long-poll. **Polling is the v1 transport.** These rules prevent the common bugs:

1. **Interval:** `1500ms`. Not faster (wasteful), not slower (feels stuck).
2. **Stop condition:** `status === 'success'` or `status === 'failed'`. Never poll a terminal job.
3. **Cleanup:** on unmount, `clearTimeout` **and** set a `cancelled` ref. Both. One without the other leaves a race.
4. **`404` handling:** the first 1–2 polls after submit may `404` (the checkpoint hasn't been written yet). Swallow it for the first ~3 seconds, then surface it as an error.
5. **No `setInterval`.** Use recursive `setTimeout` in a `poll()` function so a slow response doesn't stack up multiple in-flight requests.
6. **No polling library.** `setTimeout` is enough. Do not add React Query / SWR / TanStack for v1 — one job, one poll loop.

---

## 10. Error Handling — Required Cases

| Trigger | UI behavior |
|---|---|
| `POST /generate` → `422` | Show "Please enter a valid URL." Keep the form filled. |
| `POST /generate` → network error | Show "Couldn't reach the server. Is the backend running?" |
| `GET /jobs/:id` → `404` on first 3 polls | Treat as `pending`, keep polling silently. |
| `GET /jobs/:id` → `404` after that | Show "Job not found." |
| `GET /jobs/:id` → `5xx` | Show "Server error. Try again." Stop polling. |
| `status === 'failed'` | Show "Pipeline failed. See the feed above for details." No download button. |
| `GET /jobs/:id/sdk` → `409` | Should not happen if the button only appears on `success`. If it does, show "SDK not ready yet — try again in a moment." |

---

## 11. What Not To Do (v1 non-goals)

- **No login / auth.** Backend routes are open. Don't add a login screen.
- **No job history / list page.** The backend has no `GET /jobs` route.
- **No cancel / retry button.** No backend support.
- **No URL validation beyond `type="url"`** on the input. The backend validates with `HttpUrl`; don't duplicate the logic.
- **No WebSocket / SSE.** Polling is the contract.
- **No client-side caching / SWR / React Query.** One page, one poll loop, no cache to invalidate.
- **No CSS framework decision beyond Tailwind.** Don't add a component library (MUI, Chakra, shadcn) for two screens.
- **No prop drilling through more than one level.** See §7.
- **No `window.location` for SPA navigation.** See §4. The one exception: the download link, which is intentionally a native anchor.
- **No `useEffect` without cleanup.** See §9.

---

## 12. File Structure (suggested)

```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx              # router
    ├── index.css            # tailwind directives
    ├── api.ts               # BASE, types, fetch wrappers
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── JobPage.tsx
    │   └── NotFound.tsx
    └── components/
        └── FeedLine.tsx
```

**Five components, one API module, one router.** If the tree grows past this in v1, something is being over-built.

---

## 13. Acceptance Criteria

A reviewer should be able to check all of these off:

- [ ] `GET /` renders a form with one URL input and a Generate button.
- [ ] Submitting a valid URL navigates to `/jobs/{uuid}` **without a page reload**.
- [ ] Submitting a malformed URL shows an inline error; the page does **not** reload.
- [ ] `GET /jobs/{uuid}` polls every 1.5s; stops on `success` or `failed`.
- [ ] Scratchpad entries render in `step` order, with correct event text.
- [ ] Navigating away from `JobPage` stops the polling (no console errors, no repeated fetches in DevTools).
- [ ] On `status === 'success'`, a Download button appears and clicking it downloads a `.py` file.
- [ ] On `status === 'failed'`, no download button; error message shown.
- [ ] `preventDefault()` is called exactly once in the codebase (the form submit handler) — `grep -R preventDefault src/` returns one hit.
- [ ] No prop is passed through more than one component level.
- [ ] `npm run build` succeeds with zero TypeScript errors.

---

**Hand-off note:** the backend routes in §2 are the entire API surface. If a UI feature requires a route not listed there, it's out of scope for v1 — either cut the feature or raise it as a backend change request. Do not stub a backend route on the frontend.
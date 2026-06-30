# TastyFinder — Case Study

## Problem

Most cooking apps split discovery, planning and shopping into separate tools.
TastyFinder combines them into one coherent workspace: find recipes, generate
new ideas with AI, save favourites, plan a week and build a shopping list —
all without leaving the app.

## Target Users

- Busy home cooks who want fast recipe discovery and one-click shopping lists
- Portfolio reviewers who need a full product walkthrough without signing up
  (Demo Workspace mode provides realistic local data with no account required)
- Users who want optional AI help without it blocking the core recipe experience

## Product Decisions

| Decision | Reason |
|---|---|
| Search works without AI | Core value must not depend on an API key |
| AI activation is contextual | Banner in Generate and Chat; no persistent nag |
| Demo Workspace is local-only | Firestore writes are skipped; clearly labeled |
| Recipe detail foregrounds time, servings and difficulty | Primary decision signals for busy cooks |
| Empty states guide to next action | Reduces dead ends; no generic "nothing here" |
| Dark mode uses deep forest green | Differentiates from default charcoal; ties to food/nature |

## Architecture

```
src/app/
├── core/
│   ├── data/              Local recipe dataset (250+ recipes)
│   ├── guards/            SSR-safe Firebase auth route guard
│   ├── models/            TypeScript interfaces for all domain objects
│   ├── errors/            AppError + ErrorMapper (typed AI / parse errors)
│   ├── stores/            Focused per-domain Firestore stores (see below)
│   └── services/          Auth, Recipe, AI (Groq), n8n, Notification
├── features/              One folder per route; standalone components
└── shared/components/     Navbar, RecipeCard (computed signals), Icon registry, Skeleton
```

### Firestore Stores

Rather than a single service facade, each user-data domain has its own store:

| Store | Responsibility |
|---|---|
| `UserRecipeStore` | AI-generated recipes saved to the personal library |
| `FavoriteStore` | Recipe IDs bookmarked per user |
| `ShoppingStore` | Shopping list items with check-off state |
| `MealPlanStore` | Weekly meal plan (7-day grid) |

Each store handles its own Firestore path (`users/{uid}/…`) and exposes a
clean Observable interface to feature components.

### AI Pipeline

```
User input
  → PromptBuilder (structured prompt with preferences + ingredient list)
  → N8nService   (local dev: n8n workflow → Groq)  /  AiService (prod proxy or user key)
  → GeneratedRecipeParser (JSON extraction + schema validation + typed errors)
  → GeneratedRecipe[]  (displayed in Generate feature)
```

`GeneratedRecipeParser` guards against markdown-wrapped JSON, missing fields
and malformed AI output. `ErrorMapper` converts raw errors to a consistent
`AppError` shape before they reach templates.

## Key Engineering Decisions

### Angular Signals over RxJS for local state
All UI state (`loading`, `recipes`, `expandedId`, etc.) uses `signal()` and
`computed()`. This eliminates subscriptions for derived view state and gives
precise change-detection granularity. Only I/O boundaries (HTTP, Firestore)
use Observables, always cleaned up with `takeUntilDestroyed(destroyRef)`.

### Proxy-first AI with user-key fallback
In production, Groq requests route through a server-side `/api/groq/chat`
proxy so the API key never reaches the browser. If the proxy is unavailable
*or returns an error*, the call falls back to the user-supplied key stored
in `localStorage`. This layered approach keeps the app functional in all
deployment contexts (hosted, local dev, portfolio demo).

### SSR-safe auth guard
Firebase auth state is async. The route guard awaits the first auth emission
before deciding to redirect, preventing a flash of the login screen on hard
refresh for logged-in users — common with naive `isLoggedIn` boolean checks.

### Optimistic UI with rollback
The library delete flow removes the item from the signal immediately for
instant feedback, then awaits the Firestore write. On failure the original
list is restored and an error notification is shown — no silent data loss.

## Challenges & Solutions

| Challenge | Solution |
|---|---|
| AI responses include markdown fences and malformed JSON | Central parser with regex extraction, JSON.parse inside try/catch, typed `GeneratedRecipeParseError` |
| Firebase auth state is async on SSR | Guard waits for `authState` first emission via `firstValueFrom` before evaluating `isLoggedIn` |
| Demo mode must feel real but stay isolated | Local signal state; Firestore writes skipped; persistent demo notice via localStorage |
| Recipe images from third-party APIs fail silently | `onImageError` handler swaps in a themed warm-cream SVG fallback |
| CI must catch regressions without a Firestore emulator | Focused unit tests on parser + prompt builder; type checks on every PR |

## Engineering Takeaways

Architecture boundaries matter most where product risk is highest: AI parsing,
auth, persistence and user-facing error states. Keeping those paths typed,
tested and behind narrow interfaces makes it straightforward to extend the
product — adding a new AI provider, swapping the prompt structure or
adding a new Firestore collection — without touching feature components.

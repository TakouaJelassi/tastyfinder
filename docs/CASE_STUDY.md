# TastyFinder Case Study

## Problem

Cooking apps often split discovery, planning and shopping into separate flows.
TastyFinder combines them into one workspace: find recipes, generate new ideas,
save favorites, plan a week and build a shopping list.

## Target Users

- Busy home cooks who want fast recipe discovery
- Portfolio reviewers who need a complete product flow without creating data
- Users who want optional AI help without blocking the core recipe experience

## Product Decisions

- Search remains usable without AI.
- AI activation is contextual in Generate and AI Chat.
- Demo workspace data is saved locally in the browser and clearly labeled.
- Recipe detail pages emphasize time, servings, difficulty and shopping actions.
- Empty states guide users toward the next useful action.

## Architecture

- Angular standalone components and signals keep feature state close to the UI.
- Firebase Auth and Firestore store personal library, favorites, shopping,
  profile and meal planning data per user.
- `GeneratedRecipeParser` centralizes AI response extraction and validation.
- `PromptBuilder` keeps prompt composition outside feature components.
- `ErrorMapper` introduces a consistent application error shape.

## Firestore Store Roadmap

The current `FirestoreService` acts as a single facade. As the app grows, it can
be split into focused stores without changing feature behavior:

- `UserRecipeStore`
- `FavoriteStore`
- `ShoppingStore`
- `MealPlanStore`
- `DemoDataStore`

## Challenges

- AI responses can include markdown or malformed JSON, so direct parsing is too
  fragile for production-quality UX.
- Firebase auth state is async, so guarded routes wait for the first auth result
  before redirecting.
- Demo mode needs to feel real while staying isolated from Firestore writes.

## Solutions

- Central parser with JSON extraction, schema-like validation and typed errors.
- Contextual AI key panel instead of a permanent global banner.
- Local demo storage with a global demo workspace notice.
- GitHub Actions CI for install, type checks, focused unit tests and build.

## Learnings

Small architecture boundaries matter most where product risk is highest:
AI parsing, auth, persistence and user-facing error states. Keeping those paths
typed and testable makes the app easier to extend without losing UX quality.

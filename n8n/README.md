# n8n Workflow

TastyFinder can route local recipe generation through n8n during development.
Production uses the server-side Groq proxy instead.

## generate-recipe

Flow:

```text
Angular Generate page -> Angular dev proxy -> n8n webhook -> Groq -> n8n response
```

## Setup

1. Start n8n:

   ```bash
   N8N_SECURE_COOKIE=false npx n8n
   ```

2. Open `http://localhost:5678`.
3. Create or import a workflow with a webhook named `generate-recipe`.
4. Add your Groq API key in the n8n HTTP Request node.
5. Publish the workflow.
6. Start Angular with the dev proxy:

   ```bash
   npm start
   ```

## Webhook URL

The Angular dev proxy forwards `/n8n/*` to `http://localhost:5678`.

Current app endpoint:

```text
/n8n/webhook/generate-recipe
```

Equivalent n8n URL:

```text
http://localhost:5678/webhook/generate-recipe
```

## Request Format

```json
{
  "ingredients": "tomatoes, pasta, basil",
  "preferences": "Servings: 2; Prep time: Medium; Cuisine: Italian; Diet: Vegetarian"
}
```

## Expected Response

The app expects n8n to return one recipe object or an array of recipe objects.
The response is normalized in `N8nService` and then parsed by
`GeneratedRecipeParser`.

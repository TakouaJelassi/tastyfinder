# n8n Workflows

## recipe-chat

Webhook → Code (build Gemini prompt) → HTTP Request (Gemini API) → Response

### Setup

1. Start n8n: `n8n start`
2. Open `http://localhost:5678`
3. Import `recipe-chat.json`
4. Add your Gemini API Key in the HTTP Request node URL
5. Publish the workflow

### Webhook URL

- Test: `http://localhost:5678/webhook-test/recipe-chat`
- Production: `http://localhost:5678/webhook/recipe-chat`

### Request format

```json
{ "message": "Ich habe Tomaten und Käse" }
```

### Response

Returns Gemini API response with extracted English ingredients.

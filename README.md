# TastyFinder

**An AI-powered recipe discovery platform** — search by ingredient, generate custom recipes with AI, and manage your personal cookbook.

**[Live Demo](https://myauth-app-8d1d2.web.app)**

---

## Features

- **Recipe Search** — Search by name, ingredient or cuisine via Spoonacular API
- **AI Recipe Generator** — Enter your ingredients and get 3 tailored recipes powered by Groq AI
- **Recipe Library** — All generated recipes saved to Firestore, available anytime
- **Favorites** — Save and revisit your favorite recipes
- **AI Chatbot** — Ask the AI for recipe suggestions conversationally
- **Recipe Detail** — Full instructions, ingredients list and AI summary for each recipe
- **n8n Automation** — Local workflow automation via n8n webhooks (dev environment)
- **SSR** — Server-Side Rendering with Angular for fast initial load

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 22, TypeScript, SCSS |
| AI | Groq — Llama 3.3 70B Versatile |
| Automation | n8n (local workflow) |
| Database | Firebase Firestore |
| Recipe API | Spoonacular API |
| Hosting | Firebase Hosting |
| SSR | Angular SSR |
| State | Angular Signals + RxJS |

---

## AI Integration

TastyFinder uses **Groq AI** (Llama 3.3 70B) to generate recipe ideas from user input.

For demo purposes, users enter their own Groq API key directly in the app — no backend required. In a production environment, the API request should be handled through a secure backend or n8n webhook so the key never touches the browser.

**Architecture:**

```
Dev:        Angular → Angular Proxy → n8n Webhook → Groq → Angular
Production: Angular → Groq API (user-supplied key)
```

n8n acts as a middleware layer locally: it receives the ingredient list, calls Groq, and returns structured recipe JSON. This keeps the API key out of the frontend and demonstrates real-world workflow automation.

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 11+
- A free [Groq API Key](https://console.groq.com/keys)
- A free [Spoonacular API Key](https://spoonacular.com/food-api)

### Installation

```bash
git clone https://github.com/TakouaJelassi/tastyfinder.git
cd tastyfinder
npm install --legacy-peer-deps
```

### Environment Setup

Create `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  spoonacularApiKey: 'YOUR_SPOONACULAR_KEY',
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID'
  }
};
```

> These files are gitignored — never commit API keys or Firebase config.

### Run

```bash
npm start
```

Open `http://localhost:4200` and enter your **Groq API Key** (`gsk_...`) in the banner at the top.

### n8n (optional — local AI automation)

```bash
N8N_SECURE_COOKIE=false npx n8n
```

Open `http://localhost:5678`, import the workflow, and set up an HTTP Request node pointing to the Groq API. The app automatically routes AI calls through n8n locally and falls back to direct Groq calls in production.

---

## Project Structure

```
src/app/
├── core/
│   ├── models/          # TypeScript interfaces
│   └── services/        # AI (Groq), Recipe (Spoonacular), Firestore, n8n services
├── features/
│   ├── home/            # Recipe search + category filter
│   ├── generate/        # AI recipe generator
│   ├── library/         # Saved recipes (Firestore)
│   ├── favorites/       # Favorited recipes
│   ├── chatbot/         # AI chat assistant
│   └── recipe-detail/   # Recipe detail view
└── shared/
    └── components/      # Navbar, RecipeCard, Skeleton, ApiKeyBanner
```

---

## How It Works

1. **Search** recipes by name, ingredient or select a cuisine category
2. **Generate** — Enter your ingredients, set preferences (portions, time, cuisine, diet)
3. **Groq AI** generates 3 complete recipes with step-by-step instructions
4. Recipes are automatically saved to your **Library** (Firestore)
5. Use the **AI Chat** to ask for recipe suggestions conversationally
6. Locally: AI calls go through **n8n** for secure workflow automation

---

## What I Learned

- Integrating a third-party AI API (Groq) with an Angular frontend using user-managed keys
- Using **n8n** for local workflow automation and how to bridge it with Angular via a dev proxy
- Managing Angular SSR with Firebase Hosting (handling `index.csr.html` vs `index.html`)
- Working with the **Spoonacular API** to search and map recipe data to custom interfaces
- Building with **Angular Signals** for reactive state without NgRx
- Maintaining clean git history across multiple machines

---

## Future Improvements

- Firebase Auth (Login / Register / Google)
- Per-user Firestore collections (`users/{uid}/recipes`)
- Shopping List Generator from recipe ingredients
- Weekly Meal Planner with n8n automation
- Dietary filters (vegetarian, vegan, halal, gluten-free)
- Secure backend proxy so Groq key never touches the browser

---

## License

MIT

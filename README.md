# 🍽 TastyFinder

An **AI-powered recipe discovery platform**: browse recipes, generate custom
ones with AI, chat with a cooking assistant, and manage your personal cookbook,
favorites and shopping list.

### 🔗 Live Demo → [tastyfinder.web.app](https://tastyfinder.web.app)

---

## 📸 Product Screenshots

The screenshots below showcase the main product flows: discovery, recipe detail,
AI assistance, generation, shopping list management and profile settings.

| Home | Recipe Detail | AI Chat |
| :--: | :-----------: | :-----: |
| ![Home](screenshots/home.png) | ![Detail](screenshots/detail.png) | ![Chat](screenshots/chat.png) |

| AI Generator | Shopping List | Profile |
| :----------: | :-----------: | :-----: |
| ![Generate](screenshots/generate.png) | ![Shopping](screenshots/shopping.png) | ![Profile](screenshots/profile.png) |

---

## ✨ Features

- **Recipe Search** — search by name, ingredient or cuisine
- **AI Recipe Generator** — turn your ingredients into tailored recipes with
  **Groq AI** (Llama 3.3 70B)
- **AI Chat Assistant** — finds matching recipes and generates new ones on the fly
- **Authentication** — Email/Password and Google Sign-In via Firebase Auth
- **Personal Library** — generated recipes saved per user in Firestore
- **Favorites** — save and revisit recipes (per user)
- **Shopping List** — add ingredients from any recipe, check items off, clear done
- **Profile** — edit name, upload an avatar, change password
- **Responsive Design** — clean mobile and desktop layouts
- **SSR** — Angular Server-Side Rendering for a fast initial load

---

## 🛠 Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Frontend   | Angular 22 (Standalone, Signals), TypeScript, SCSS |
| AI         | **Groq** — Llama 3.3 70B Versatile               |
| Auth       | Firebase Authentication                          |
| Database   | Cloud Firestore (per-user collections)           |
| Automation | **n8n** (local workflow, optional)               |
| Hosting    | Firebase Hosting + Angular SSR                    |
| State      | Angular Signals + RxJS                           |

---

## 🤖 Groq AI

TastyFinder uses **Groq AI** (Llama 3.3 70B) for two things:

1. **Recipe generation** — turns a list of ingredients and preferences into
   complete recipes (steps, durations, portions).
2. **Chat assistant** — generates a fresh recipe when nothing matches the
   local collection.

For the demo, users enter their own Groq API key, stored only in the browser's
`localStorage`. In production this should run through a secure backend or an n8n
webhook so the key never reaches the client.

```text
Dev:         Angular → Angular Proxy → n8n Webhook → Groq
Production:   Angular → Groq API (user-supplied key)
```

---

## 🔥 Firebase

Firebase powers authentication, data and hosting.

- **Authentication** — Email/Password + Google provider
- **Firestore** — each user owns their data under `users/{uid}/…`:

  ```text
  users/{uid}/recipes     # AI-generated recipes (library)
  users/{uid}/favorites   # favorited recipe ids
  users/{uid}/shopping    # shopping list items
  users/{uid}/profile     # display name + avatar
  ```

- **Security Rules** — users can only read/write their own subtree
  (see [`firestore.rules`](firestore.rules))
- **Hosting** — the SSR build is deployed to Firebase Hosting

---

## 🔗 n8n Workflow

In local development, AI calls can be routed through an **n8n** workflow instead
of calling Groq directly from the browser — demonstrating real-world workflow
automation and keeping the API key server-side.

```text
Webhook → Code (build prompt) → HTTP Request (Groq API) → Response
```

The Angular dev proxy ([`proxy.conf.json`](proxy.conf.json)) forwards `/n8n/*`
to the local n8n instance. See [`n8n/README.md`](n8n/README.md) for setup.
In production the app falls back to calling Groq directly.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- npm 11+
- A free [Groq API Key](https://console.groq.com/keys) for the AI features

### Installation

```bash
git clone https://github.com/TakouaJelassi/tastyfinder.git
cd tastyfinder
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because `@angular/fire@20` pins `firebase@^11`.

### Environment Setup

Create `src/environments/environment.ts` and `environment.prod.ts`
(both are gitignored):

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
```

### Run

```bash
npm start          # http://localhost:4200
```

Enter your **Groq API Key** (`gsk_...`) in the banner to enable AI features.

### Optional: n8n (local AI automation)

```bash
N8N_SECURE_COOKIE=false npx n8n   # http://localhost:5678
```

---

## 📁 Project Structure

```text
src/app/
├── core/
│   ├── data/            # Local recipe dataset
│   ├── guards/          # Auth route guard
│   ├── models/          # TypeScript interfaces
│   └── services/        # Auth, Recipe, Firestore, AI (Groq), n8n
├── features/
│   ├── home/            # Search + category filter
│   ├── generate/        # AI recipe generator
│   ├── chatbot/         # AI chat assistant
│   ├── library/         # Saved recipes
│   ├── favorites/       # Favorited recipes
│   ├── shopping/        # Shopping list
│   ├── profile/         # User profile
│   ├── auth/            # Login / Register
│   └── recipe-detail/   # Recipe detail view
└── shared/
    └── components/      # Navbar, RecipeCard, Skeleton, ApiKeyBanner
```

---

## 🧩 Engineering Highlights

- Modern Angular architecture with **Standalone Components**, **Signals** and
  lazy-loaded feature routes
- Firebase Authentication with an SSR-safe route guard and per-user Firestore
  data boundaries
- AI recipe generation and conversational search powered by Groq, with an
  optional n8n workflow for local automation
- Firestore-backed personal library, favorites, shopping list, profile and meal
  planning flows
- Responsive SCSS design system with reusable shared components for navigation,
  recipe cards, skeleton loading and API-key management
- Firebase Hosting deployment with Angular SSR support

---

## 🗺 Product Roadmap

- Demo workspace with seeded data for recruiters and product reviewers
- Secure backend or n8n production proxy so the Groq key never reaches the browser
- Dietary filters (vegetarian, vegan, gluten-free)
- Recipe ratings and notes
- More resilient AI response validation and recovery

---

## 📄 License

MIT

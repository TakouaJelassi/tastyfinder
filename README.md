# 🍽 TastyFinder

An AI-powered recipe app built with Angular 22 and Google Gemini. Search recipes from a global database, generate custom recipes from your ingredients, and manage your personal recipe library.

---

## Features

- **Recipe Search** — Search by name or ingredient via MealDB API with live suggestions
- **AI Recipe Generator** — Input your ingredients and get 3 tailored recipes from Gemini AI
- **Recipe Library** — All generated recipes saved to Firestore, available anytime
- **Favorites** — Save and revisit your favorite recipes (localStorage)
- **AI Chatbot** — Ask the AI for recipe suggestions based on what you have at home
- **Recipe Detail** — Full instructions, ingredients, and YouTube video for each recipe
- **SSR** — Server-Side Rendering with Angular for fast initial load

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22, TypeScript, SCSS |
| AI | Google Gemini 2.5 Flash Lite |
| Database | Firebase Firestore |
| API | MealDB API |
| SSR | Angular SSR |
| State | Angular Signals + RxJS |

## Getting Started

### Prerequisites

- Node.js 22+
- Angular CLI 22+
- A free [Gemini API Key](https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/takoua-jelassi/tastyfinder.git
cd tastyfinder
npm install
```

### Environment Setup

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

Fill in your Firebase config in both files. Get it from [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps.

### Run

```bash
ng serve
```

Open `http://localhost:4200` and enter your Gemini API Key in the banner at the top.

## Project Structure

```
src/app/
├── core/
│   ├── models/          # TypeScript interfaces
│   └── services/        # AI, Recipe, Firestore services
├── features/
│   ├── home/            # Recipe search
│   ├── generate/        # AI recipe generator
│   ├── library/         # Saved recipes
│   ├── favorites/       # Favorited recipes
│   ├── chatbot/         # AI chat
│   └── recipe-detail/   # Recipe detail view
└── shared/
    └── components/      # Navbar, RecipeCard, Skeleton, ApiKeyBanner
```

## How It Works

1. Enter your available ingredients in the **Generieren** page
2. Set preferences: portions, cooking time, cuisine style, diet
3. Gemini AI generates 3 complete recipes with step-by-step instructions
4. Recipes are automatically saved to your **Bibliothek**
5. Use the **AI Chat** to ask for recipe suggestions conversationally

## License

MIT

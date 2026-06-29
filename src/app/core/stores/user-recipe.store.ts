import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { AuthService } from '../services/auth';
import { DemoDataStore } from './demo-data.store';
import { GeneratedRecipe } from '../models/generated-recipe.interface';

const DEMO_KEY = 'tf_demo_library';

const DEMO_RECIPES: GeneratedRecipe[] = [
  {
    id: 'demo-1',
    title: 'Mediterrane Orzo Bowl',
    ingredients: ['Orzo', 'Cherry tomatoes', 'Feta', 'Cucumber', 'Olives', 'Lemon', 'Olive oil'],
    missingIngredients: ['Frische Minze'],
    steps: [
      { step: 1, description: 'Cook orzo al dente and let cool briefly.' },
      { step: 2, description: 'Dice vegetables, crumble feta and toss everything together.' },
      { step: 3, description: 'Season with lemon, olive oil, salt and pepper.' },
    ],
    duration: '25 Min',
    difficulty: 'Einfach',
    cuisine: 'Mediterran',
    diet: 'Vegetarisch',
    portions: 2,
  },
  {
    id: 'demo-2',
    title: 'Spicy Peanut Noodles',
    ingredients: [
      'Reisnudeln',
      'Erdnussbutter',
      'Sojasauce',
      'Limette',
      'Karotte',
      'Spring onion',
    ],
    missingIngredients: ['Sesam'],
    steps: [
      { step: 1, description: 'Nudeln nach Packungsangabe garen.' },
      {
        step: 2,
        description: 'Whisk together peanut butter, soy sauce, lime juice and warm water.',
      },
      {
        step: 3,
        description: 'Toss noodles with sauce and vegetables.',
        parallel: true,
        assignedTo: 1,
      },
    ],
    duration: '20 Min',
    difficulty: 'Einfach',
    cuisine: 'Asian Fusion',
    diet: 'Vegan',
    portions: 2,
  },
];

/** Bibliothek: vom Nutzer (oder per AI) generierte Rezepte. */
@Injectable({ providedIn: 'root' })
export class UserRecipeStore {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private demo = inject(DemoDataStore);

  save(recipe: Omit<GeneratedRecipe, 'id' | 'createdAt'>): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) return Promise.resolve();
    if (this.demo.isDemo) {
      const recipes = this.demo.read(DEMO_KEY, DEMO_RECIPES);
      recipes.unshift({ ...recipe, id: `demo-${Date.now()}` });
      this.demo.write(DEMO_KEY, recipes);
      return Promise.resolve();
    }
    const col = collection(this.firestore, `users/${uid}/recipes`);
    return addDoc(col, { ...recipe, createdAt: Timestamp.now() }).then(() => {});
  }

  list(): Observable<GeneratedRecipe[]> {
    const uid = this.auth.uid;
    if (!uid) return of([]);
    if (this.demo.isDemo) return of(this.demo.read(DEMO_KEY, DEMO_RECIPES));
    const col = collection(this.firestore, `users/${uid}/recipes`);
    const q = query(col, orderBy('createdAt', 'desc'));
    return from(
      getDocs(q).then((snap) =>
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GeneratedRecipe),
      ),
    );
  }
}

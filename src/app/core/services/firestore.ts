import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  orderBy,
  query,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { AuthService } from './auth';
import { GeneratedRecipe } from '../models/generated-recipe.interface';
import { ShoppingItem, MealPlan } from '../models/recipe.interface';

const DEMO_LIBRARY_KEY = 'tf_demo_library';
const DEMO_FAVORITES_KEY = 'tf_demo_favorites';
const DEMO_SHOPPING_KEY = 'tf_demo_shopping';
const DEMO_PROFILE_KEY = 'tf_demo_profile';
const DEMO_MEAL_PLAN_KEY = 'tf_demo_meal_plan';

const DEMO_RECIPES: GeneratedRecipe[] = [
  {
    id: 'demo-1',
    title: 'Mediterrane Orzo Bowl',
    ingredients: ['Orzo', 'Kirschtomaten', 'Feta', 'Gurke', 'Oliven', 'Zitrone', 'Olivenöl'],
    missingIngredients: ['Frische Minze'],
    steps: [
      { step: 1, description: 'Orzo al dente kochen und kurz abkühlen lassen.' },
      { step: 2, description: 'Gemüse schneiden, Feta zerbröseln und alles vermengen.' },
      { step: 3, description: 'Mit Zitrone, Olivenöl, Salz und Pfeffer abschmecken.' },
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
      'Frühlingszwiebel',
    ],
    missingIngredients: ['Sesam'],
    steps: [
      { step: 1, description: 'Nudeln nach Packungsangabe garen.' },
      {
        step: 2,
        description: 'Sauce aus Erdnussbutter, Sojasauce, Limette und warmem Wasser rühren.',
      },
      {
        step: 3,
        description: 'Nudeln mit Sauce und Gemüse vermengen.',
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

const DEMO_SHOPPING_ITEMS: ShoppingItem[] = [
  { id: 'demo-shopping-1', name: 'Kirschtomaten', checked: false },
  { id: 'demo-shopping-2', name: 'Feta', checked: false },
  { id: 'demo-shopping-3', name: 'Limetten', checked: true },
];

const DEMO_MEAL_PLAN: MealPlan = {
  mon: ['1'],
  tue: ['4'],
  wed: ['8'],
  thu: ['14'],
  fri: ['22'],
  sat: [],
  sun: ['18'],
};

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  private get uid(): string | null {
    return this.auth.uid;
  }

  // ── Generated Recipes (Library) ──

  saveRecipe(recipe: Omit<GeneratedRecipe, 'id' | 'createdAt'>): Promise<void> {
    const uid = this.uid;
    if (!uid) return Promise.resolve();
    if (this.isDemo) {
      const recipes = this.getDemoLibrary();
      recipes.unshift({ ...recipe, id: `demo-${Date.now()}` });
      this.writeDemo(DEMO_LIBRARY_KEY, recipes);
      return Promise.resolve();
    }
    const col = collection(this.firestore, `users/${uid}/recipes`);
    return addDoc(col, { ...recipe, createdAt: Timestamp.now() }).then(() => {});
  }

  getRecipes(): Observable<GeneratedRecipe[]> {
    const uid = this.uid;
    if (!uid) return of([]);
    if (this.isDemo) return of(this.getDemoLibrary());
    const col = collection(this.firestore, `users/${uid}/recipes`);
    const q = query(col, orderBy('createdAt', 'desc'));
    return from(
      getDocs(q).then((snap) =>
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GeneratedRecipe),
      ),
    );
  }

  // ── Favorites ──

  async addFavorite(recipeId: string): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    if (this.isDemo) {
      const ids = new Set(this.readDemo<string[]>(DEMO_FAVORITES_KEY, ['2', '4', '8']));
      ids.add(recipeId);
      this.writeDemo(DEMO_FAVORITES_KEY, Array.from(ids));
      return;
    }
    const ref = doc(this.firestore, `users/${uid}/favorites/${recipeId}`);
    await setDoc(ref, { addedAt: new Date().toISOString() });
  }

  async removeFavorite(recipeId: string): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    if (this.isDemo) {
      const ids = this.readDemo<string[]>(DEMO_FAVORITES_KEY, ['2', '4', '8']).filter(
        (id) => id !== recipeId,
      );
      this.writeDemo(DEMO_FAVORITES_KEY, ids);
      return;
    }
    const ref = doc(this.firestore, `users/${uid}/favorites/${recipeId}`);
    await deleteDoc(ref);
  }

  getFavoriteIds(): Observable<string[]> {
    const uid = this.uid;
    if (!uid) return of([]);
    if (this.isDemo) return of(this.readDemo<string[]>(DEMO_FAVORITES_KEY, ['2', '4', '8']));
    const col = collection(this.firestore, `users/${uid}/favorites`);
    return from(getDocs(col).then((snap) => snap.docs.map((d) => d.id)));
  }

  isFavorite(recipeId: string): Observable<boolean> {
    const uid = this.uid;
    if (!uid) return of(false);
    if (this.isDemo) {
      return of(this.readDemo<string[]>(DEMO_FAVORITES_KEY, ['2', '4', '8']).includes(recipeId));
    }
    const ref = doc(this.firestore, `users/${uid}/favorites/${recipeId}`);
    return from(getDoc(ref).then((snap) => snap.exists()));
  }

  // ── User Profile ──

  async saveUserProfile(data: { displayName?: string; avatarBase64?: string }): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    if (this.isDemo) {
      const profile = this.readDemo<{ displayName?: string; avatarBase64?: string }>(
        DEMO_PROFILE_KEY,
        { displayName: 'Demo Workspace' },
      );
      this.writeDemo(DEMO_PROFILE_KEY, { ...profile, ...data });
      return;
    }
    const ref = doc(this.firestore, `users/${uid}/profile/data`);
    await setDoc(ref, data, { merge: true });
  }

  getUserProfile(): Observable<{ displayName?: string; avatarBase64?: string } | undefined> {
    const uid = this.uid;
    if (!uid) return of(undefined);
    if (this.isDemo) {
      return of(
        this.readDemo<{ displayName?: string; avatarBase64?: string }>(DEMO_PROFILE_KEY, {
          displayName: 'Demo Workspace',
        }),
      );
    }
    const ref = doc(this.firestore, `users/${uid}/profile/data`);
    return from(
      getDoc(ref).then((snap) =>
        snap.exists()
          ? (snap.data() as { displayName?: string; avatarBase64?: string })
          : undefined,
      ),
    );
  }

  // ── Shopping List ──

  getShoppingList(): Observable<ShoppingItem[]> {
    const uid = this.uid;
    if (!uid) return of([]);
    if (this.isDemo) {
      return of(
        this.readDemo<ShoppingItem[]>(DEMO_SHOPPING_KEY, DEMO_SHOPPING_ITEMS).sort(
          (a, b) => Number(a.checked) - Number(b.checked),
        ),
      );
    }
    const col = collection(this.firestore, `users/${uid}/shopping`);
    return from(
      getDocs(col).then((snap) =>
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<ShoppingItem, 'id'>) }))
          .sort((a, b) => Number(a.checked) - Number(b.checked)),
      ),
    );
  }

  /** Fügt mehrere Zutaten auf einmal hinzu (Duplikate werden übersprungen). */
  async addShoppingItems(names: string[]): Promise<void> {
    const uid = this.uid;
    if (!uid || names.length === 0) return;
    if (this.isDemo) {
      const items = this.readDemo<ShoppingItem[]>(DEMO_SHOPPING_KEY, DEMO_SHOPPING_ITEMS);
      const existingNames = new Set(items.map((item) => item.name.toLowerCase().trim()));
      for (const name of names) {
        const clean = name.trim();
        if (!clean || existingNames.has(clean.toLowerCase())) continue;
        existingNames.add(clean.toLowerCase());
        items.push({
          id: `demo-shopping-${Date.now()}-${items.length}`,
          name: clean,
          checked: false,
        });
      }
      this.writeDemo(DEMO_SHOPPING_KEY, items);
      return;
    }
    const col = collection(this.firestore, `users/${uid}/shopping`);

    const existing = await getDocs(col);
    const existingNames = new Set(
      existing.docs.map((d) => (d.data()['name'] as string)?.toLowerCase().trim()),
    );

    const batch = writeBatch(this.firestore);
    for (const name of names) {
      const clean = name.trim();
      if (!clean || existingNames.has(clean.toLowerCase())) continue;
      existingNames.add(clean.toLowerCase());
      batch.set(doc(col), { name: clean, checked: false, createdAt: Timestamp.now() });
    }
    await batch.commit();
  }

  async toggleShoppingItem(id: string, checked: boolean): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    if (this.isDemo) {
      const items = this.readDemo<ShoppingItem[]>(DEMO_SHOPPING_KEY, DEMO_SHOPPING_ITEMS).map(
        (item) => (item.id === id ? { ...item, checked } : item),
      );
      this.writeDemo(DEMO_SHOPPING_KEY, items);
      return;
    }
    await updateDoc(doc(this.firestore, `users/${uid}/shopping/${id}`), { checked });
  }

  async removeShoppingItem(id: string): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    if (this.isDemo) {
      const items = this.readDemo<ShoppingItem[]>(DEMO_SHOPPING_KEY, DEMO_SHOPPING_ITEMS).filter(
        (item) => item.id !== id,
      );
      this.writeDemo(DEMO_SHOPPING_KEY, items);
      return;
    }
    await deleteDoc(doc(this.firestore, `users/${uid}/shopping/${id}`));
  }

  async clearCheckedShoppingItems(): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    if (this.isDemo) {
      const items = this.readDemo<ShoppingItem[]>(DEMO_SHOPPING_KEY, DEMO_SHOPPING_ITEMS).filter(
        (item) => !item.checked,
      );
      this.writeDemo(DEMO_SHOPPING_KEY, items);
      return;
    }
    const col = collection(this.firestore, `users/${uid}/shopping`);
    const snap = await getDocs(col);
    const batch = writeBatch(this.firestore);
    snap.docs.filter((d) => d.data()['checked'] === true).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  // ── Meal Plan ──

  getMealPlan(): Observable<MealPlan | undefined> {
    const uid = this.uid;
    if (!uid) return of(undefined);
    if (this.isDemo) return of(this.readDemo<MealPlan>(DEMO_MEAL_PLAN_KEY, DEMO_MEAL_PLAN));
    const ref = doc(this.firestore, `users/${uid}/mealplan/data`);
    return from(
      getDoc(ref).then((snap) => (snap.exists() ? (snap.data() as MealPlan) : undefined)),
    );
  }

  async saveMealPlan(plan: MealPlan): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    if (this.isDemo) {
      this.writeDemo(DEMO_MEAL_PLAN_KEY, plan);
      return;
    }
    const ref = doc(this.firestore, `users/${uid}/mealplan/data`);
    await setDoc(ref, plan);
  }

  private get isDemo(): boolean {
    return this.auth.isDemo;
  }

  private getDemoLibrary(): GeneratedRecipe[] {
    return this.readDemo<GeneratedRecipe[]>(DEMO_LIBRARY_KEY, DEMO_RECIPES);
  }

  private readDemo<T>(key: string, fallback: T): T {
    if (!isPlatformBrowser(this.platformId)) return this.cloneDemo(fallback);
    const raw = localStorage.getItem(key);
    if (!raw) return this.cloneDemo(fallback);
    try {
      return JSON.parse(raw) as T;
    } catch {
      return this.cloneDemo(fallback);
    }
  }

  private writeDemo<T>(key: string, value: T): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  private cloneDemo<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

import { Injectable, inject } from '@angular/core';
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
import { ShoppingItem } from '../models/recipe.interface';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private get uid(): string | null {
    return this.auth.uid;
  }

  // ── Generated Recipes (Library) ──

  saveRecipe(recipe: Omit<GeneratedRecipe, 'id' | 'createdAt'>): Promise<void> {
    const uid = this.uid;
    if (!uid) return Promise.resolve();
    const col = collection(this.firestore, `users/${uid}/recipes`);
    return addDoc(col, { ...recipe, createdAt: Timestamp.now() }).then(() => {});
  }

  getRecipes(): Observable<GeneratedRecipe[]> {
    const uid = this.uid;
    if (!uid) return of([]);
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
    const ref = doc(this.firestore, `users/${uid}/favorites/${recipeId}`);
    await setDoc(ref, { addedAt: new Date().toISOString() });
  }

  async removeFavorite(recipeId: string): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    const ref = doc(this.firestore, `users/${uid}/favorites/${recipeId}`);
    await deleteDoc(ref);
  }

  getFavoriteIds(): Observable<string[]> {
    const uid = this.uid;
    if (!uid) return of([]);
    const col = collection(this.firestore, `users/${uid}/favorites`);
    return from(getDocs(col).then((snap) => snap.docs.map((d) => d.id)));
  }

  isFavorite(recipeId: string): Observable<boolean> {
    const uid = this.uid;
    if (!uid) return of(false);
    const ref = doc(this.firestore, `users/${uid}/favorites/${recipeId}`);
    return from(getDoc(ref).then((snap) => snap.exists()));
  }

  // ── User Profile ──

  async saveUserProfile(data: { displayName?: string; avatarBase64?: string }): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    const ref = doc(this.firestore, `users/${uid}/profile/data`);
    await setDoc(ref, data, { merge: true });
  }

  getUserProfile(): Observable<{ displayName?: string; avatarBase64?: string } | undefined> {
    const uid = this.uid;
    if (!uid) return of(undefined);
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
    await updateDoc(doc(this.firestore, `users/${uid}/shopping/${id}`), { checked });
  }

  async removeShoppingItem(id: string): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    await deleteDoc(doc(this.firestore, `users/${uid}/shopping/${id}`));
  }

  async clearCheckedShoppingItems(): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    const col = collection(this.firestore, `users/${uid}/shopping`);
    const snap = await getDocs(col);
    const batch = writeBatch(this.firestore);
    snap.docs.filter((d) => d.data()['checked'] === true).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

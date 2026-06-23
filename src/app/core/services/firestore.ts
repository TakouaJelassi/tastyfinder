import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  orderBy,
  query,
  doc,
  setDoc,
  deleteDoc,
  docData,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth';
import { GeneratedRecipe } from '../models/generated-recipe.interface';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private get uid(): string | null {
    return this.auth.uid;
  }

  // ── Generated Recipes (Library) ──────────────────────────────────────────

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
    return collectionData(q, { idField: 'id' }) as Observable<GeneratedRecipe[]>;
  }

  // ── Favorites ─────────────────────────────────────────────────────────────

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
    return new Observable((observer) => {
      collectionData(col, { idField: 'id' }).subscribe((docs: unknown[]) => {
        observer.next((docs as { id: string }[]).map((d) => d.id));
      });
    });
  }

  isFavorite(recipeId: string): Observable<boolean> {
    const uid = this.uid;
    if (!uid) return of(false);
    const ref = doc(this.firestore, `users/${uid}/favorites/${recipeId}`);
    return new Observable((observer) => {
      docData(ref).subscribe((data) => observer.next(!!data));
    });
  }

  // ── User Profile ──────────────────────────────────────────────────────────

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
    return docData(ref) as Observable<{ displayName?: string; avatarBase64?: string } | undefined>;
  }
}

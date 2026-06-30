import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { AuthService } from '../services/auth';
import { DemoDataStore } from './demo-data.store';

const DEMO_KEY = 'tf_demo_favorites';
const DEMO_DEFAULT = ['2', '4', '8'];

/** Per-user favorite recipe IDs. */
@Injectable({ providedIn: 'root' })
export class FavoriteStore {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private demo = inject(DemoDataStore);

  async add(recipeId: string): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) return;
    if (this.demo.isDemo) {
      const ids = new Set(this.demo.read(DEMO_KEY, DEMO_DEFAULT));
      ids.add(recipeId);
      this.demo.write(DEMO_KEY, Array.from(ids));
      return;
    }
    await setDoc(doc(this.firestore, `users/${uid}/favorites/${recipeId}`), {
      addedAt: new Date().toISOString(),
    });
  }

  async remove(recipeId: string): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) return;
    if (this.demo.isDemo) {
      const ids = this.demo.read(DEMO_KEY, DEMO_DEFAULT).filter((id) => id !== recipeId);
      this.demo.write(DEMO_KEY, ids);
      return;
    }
    await deleteDoc(doc(this.firestore, `users/${uid}/favorites/${recipeId}`));
  }

  ids(): Observable<string[]> {
    const uid = this.auth.uid;
    if (!uid) return of([]);
    if (this.demo.isDemo) return of(this.demo.read(DEMO_KEY, DEMO_DEFAULT));
    const col = collection(this.firestore, `users/${uid}/favorites`);
    return from(getDocs(col).then((snap) => snap.docs.map((d) => d.id)));
  }

  isFavorite(recipeId: string): Observable<boolean> {
    const uid = this.auth.uid;
    if (!uid) return of(false);
    if (this.demo.isDemo) return of(this.demo.read(DEMO_KEY, DEMO_DEFAULT).includes(recipeId));
    const ref = doc(this.firestore, `users/${uid}/favorites/${recipeId}`);
    return from(getDoc(ref).then((snap) => snap.exists()));
  }
}

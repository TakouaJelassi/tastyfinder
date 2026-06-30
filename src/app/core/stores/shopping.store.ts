import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { AuthService } from '../services/auth';
import { DemoDataStore } from './demo-data.store';
import { ShoppingItem } from '../models/recipe.interface';
import { uniqueNewShoppingNames } from '../utils/shopping-items';

const DEMO_KEY = 'tf_demo_shopping';

const DEMO_ITEMS: ShoppingItem[] = [
  { id: 'demo-shopping-1', name: 'Cherry tomatoes', checked: false },
  { id: 'demo-shopping-2', name: 'Feta', checked: false },
  { id: 'demo-shopping-3', name: 'Limes', checked: true },
];

const byChecked = (a: ShoppingItem, b: ShoppingItem) => Number(a.checked) - Number(b.checked);

/** Per-user shopping list. */
@Injectable({ providedIn: 'root' })
export class ShoppingStore {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private demo = inject(DemoDataStore);

  list(): Observable<ShoppingItem[]> {
    const uid = this.auth.uid;
    if (!uid) return of([]);
    if (this.demo.isDemo) return of(this.demo.read(DEMO_KEY, DEMO_ITEMS).sort(byChecked));
    const col = collection(this.firestore, `users/${uid}/shopping`);
    return from(
      getDocs(col).then((snap) =>
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<ShoppingItem, 'id'>) }))
          .sort(byChecked),
      ),
    );
  }

  /** Adds multiple ingredients at once; duplicates are skipped. */
  async add(names: string[]): Promise<void> {
    const uid = this.auth.uid;
    if (!uid || names.length === 0) return;
    if (this.demo.isDemo) {
      const items = this.demo.read(DEMO_KEY, DEMO_ITEMS);
      const newNames = uniqueNewShoppingNames(
        items.map((i) => i.name),
        names,
      );
      for (const name of newNames) {
        items.push({ id: `demo-shopping-${Date.now()}-${items.length}`, name, checked: false });
      }
      this.demo.write(DEMO_KEY, items);
      return;
    }
    const col = collection(this.firestore, `users/${uid}/shopping`);
    const existing = await getDocs(col);
    const newNames = uniqueNewShoppingNames(
      existing.docs.map((d) => (d.data()['name'] as string) ?? ''),
      names,
    );
    const batch = writeBatch(this.firestore);
    for (const name of newNames) {
      batch.set(doc(col), { name, checked: false, createdAt: Timestamp.now() });
    }
    await batch.commit();
  }

  async toggle(id: string, checked: boolean): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) return;
    if (this.demo.isDemo) {
      const items = this.demo
        .read(DEMO_KEY, DEMO_ITEMS)
        .map((i) => (i.id === id ? { ...i, checked } : i));
      this.demo.write(DEMO_KEY, items);
      return;
    }
    await updateDoc(doc(this.firestore, `users/${uid}/shopping/${id}`), { checked });
  }

  async remove(id: string): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) return;
    if (this.demo.isDemo) {
      const items = this.demo.read(DEMO_KEY, DEMO_ITEMS).filter((i) => i.id !== id);
      this.demo.write(DEMO_KEY, items);
      return;
    }
    await deleteDoc(doc(this.firestore, `users/${uid}/shopping/${id}`));
  }

  async clearChecked(): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) return;
    if (this.demo.isDemo) {
      const items = this.demo.read(DEMO_KEY, DEMO_ITEMS).filter((i) => !i.checked);
      this.demo.write(DEMO_KEY, items);
      return;
    }
    const col = collection(this.firestore, `users/${uid}/shopping`);
    const snap = await getDocs(col);
    const batch = writeBatch(this.firestore);
    snap.docs.filter((d) => d.data()['checked'] === true).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

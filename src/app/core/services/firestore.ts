import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  orderBy,
  query,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { GeneratedRecipe } from '../models/generated-recipe.interface';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore = inject(Firestore);

  /** Speichert ein generiertes Rezept in Firestore */
  saveRecipe(recipe: Omit<GeneratedRecipe, 'id' | 'createdAt'>): Promise<void> {
    const col = collection(this.firestore, 'recipes');
    return addDoc(col, { ...recipe, createdAt: Timestamp.now() }).then(() => {});
  }

  /** Gibt alle gespeicherten Rezepte zurück (neueste zuerst) */
  getRecipes(): Observable<GeneratedRecipe[]> {
    const col = collection(this.firestore, 'recipes');
    const q = query(col, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<GeneratedRecipe[]>;
  }
}

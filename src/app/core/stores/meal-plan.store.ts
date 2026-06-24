import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { AuthService } from '../services/auth';
import { DemoDataStore } from './demo-data.store';
import { MealPlan } from '../models/recipe.interface';

const DEMO_KEY = 'tf_demo_meal_plan';

const DEMO_PLAN: MealPlan = {
  mon: ['1'],
  tue: ['4'],
  wed: ['8'],
  thu: ['14'],
  fri: ['22'],
  sat: [],
  sun: ['18'],
};

/** Wochenplan pro Nutzer. */
@Injectable({ providedIn: 'root' })
export class MealPlanStore {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private demo = inject(DemoDataStore);

  get(): Observable<MealPlan | undefined> {
    const uid = this.auth.uid;
    if (!uid) return of(undefined);
    if (this.demo.isDemo) return of(this.demo.read(DEMO_KEY, DEMO_PLAN));
    const ref = doc(this.firestore, `users/${uid}/mealplan/data`);
    return from(
      getDoc(ref).then((snap) => (snap.exists() ? (snap.data() as MealPlan) : undefined)),
    );
  }

  async save(plan: MealPlan): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) return;
    if (this.demo.isDemo) {
      this.demo.write(DEMO_KEY, plan);
      return;
    }
    await setDoc(doc(this.firestore, `users/${uid}/mealplan/data`), plan);
  }
}

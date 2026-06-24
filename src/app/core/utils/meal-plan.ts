import { MealPlan, WeekDay } from '../models/recipe.interface';

export const WEEK_DAYS: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const EMPTY_MEAL_PLAN: MealPlan = {
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
};

/**
 * Stellt sicher, dass ein (evtl. unvollständiger) gespeicherter Plan alle
 * Wochentage enthält. Unbekannte Tage werden ignoriert.
 */
export function normalizeMealPlan(plan?: Partial<MealPlan> | null): MealPlan {
  const normalized: MealPlan = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
  if (!plan) return normalized;
  for (const day of WEEK_DAYS) {
    const value = plan[day];
    normalized[day] = Array.isArray(value) ? [...value] : [];
  }
  return normalized;
}

/** Alle Rezept-IDs eines Plans (über alle Tage, in Wochenreihenfolge). */
export function collectPlanIds(plan: MealPlan): string[] {
  return WEEK_DAYS.flatMap((day) => plan[day]);
}

/** Anzahl geplanter Gerichte in der Woche. */
export function countPlannedMeals(plan: MealPlan): number {
  return collectPlanIds(plan).length;
}

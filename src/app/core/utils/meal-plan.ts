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

/** Ensures a (possibly partial) saved plan has all seven days; unknown keys are ignored. */
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

/** All recipe IDs in the plan across all days, in week order. */
export function collectPlanIds(plan: MealPlan): string[] {
  return WEEK_DAYS.flatMap((day) => plan[day]);
}

/** Number of meals planned for the week. */
export function countPlannedMeals(plan: MealPlan): number {
  return collectPlanIds(plan).length;
}

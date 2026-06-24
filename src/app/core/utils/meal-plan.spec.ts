import { describe, expect, it } from 'vitest';
import { MealPlan } from '../models/recipe.interface';
import { normalizeMealPlan, collectPlanIds, countPlannedMeals, EMPTY_MEAL_PLAN } from './meal-plan';

describe('meal-plan utils', () => {
  it('normalizes an undefined plan to all empty days', () => {
    expect(normalizeMealPlan(undefined)).toEqual(EMPTY_MEAL_PLAN);
  });

  it('fills missing days when loading a partial plan', () => {
    const stored = { mon: ['1', '2'], fri: ['8'] } as Partial<MealPlan>;
    const plan = normalizeMealPlan(stored);

    expect(plan.mon).toEqual(['1', '2']);
    expect(plan.fri).toEqual(['8']);
    expect(plan.tue).toEqual([]);
    expect(plan.sun).toEqual([]);
  });

  it('ignores non-array day values defensively', () => {
    const corrupt = { mon: 'oops' } as unknown as Partial<MealPlan>;
    expect(normalizeMealPlan(corrupt).mon).toEqual([]);
  });

  it('collects all ids in week order', () => {
    const plan = normalizeMealPlan({ mon: ['1'], wed: ['3'], sun: ['7'] });
    expect(collectPlanIds(plan)).toEqual(['1', '3', '7']);
  });

  it('counts planned meals across the week', () => {
    const plan = normalizeMealPlan({ mon: ['1', '2'], tue: ['3'] });
    expect(countPlannedMeals(plan)).toBe(3);
  });
});

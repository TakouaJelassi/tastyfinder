import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../core/services/recipe';
import { FirestoreService } from '../../core/services/firestore';
import { RecipePreview, MealPlan, WeekDay } from '../../core/models/recipe.interface';
import { onImageError } from '../../shared/image-fallback';

interface DayColumn {
  key: WeekDay;
  label: string;
  recipes: RecipePreview[];
}

const EMPTY_PLAN: MealPlan = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };

const DAY_LABELS: { key: WeekDay; label: string }[] = [
  { key: 'mon', label: 'Montag' },
  { key: 'tue', label: 'Dienstag' },
  { key: 'wed', label: 'Mittwoch' },
  { key: 'thu', label: 'Donnerstag' },
  { key: 'fri', label: 'Freitag' },
  { key: 'sat', label: 'Samstag' },
  { key: 'sun', label: 'Sonntag' },
];

@Component({
  selector: 'app-planner',
  imports: [],
  templateUrl: './planner.html',
  styleUrl: './planner.scss',
})
export class Planner implements OnInit {
  private recipeService = inject(RecipeService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  onImageError = onImageError;

  private plan = signal<MealPlan>({ ...EMPTY_PLAN });
  loading = signal(true);
  saving = signal(false);
  pickerDay = signal<WeekDay | null>(null);
  addedToShopping = signal(false);

  allRecipes: RecipePreview[] = this.recipeService.listAll();

  days = computed<DayColumn[]>(() =>
    DAY_LABELS.map((d) => ({
      key: d.key,
      label: d.label,
      recipes: this.recipeService.findByIds(this.plan()[d.key]).map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
      })),
    })),
  );

  totalMeals = computed(() => Object.values(this.plan()).reduce((sum, ids) => sum + ids.length, 0));

  ngOnInit(): void {
    this.firestoreService.getMealPlan().subscribe((plan) => {
      if (plan) this.plan.set({ ...EMPTY_PLAN, ...plan });
      this.loading.set(false);
    });
  }

  openPicker(day: WeekDay): void {
    this.pickerDay.set(day);
  }

  closePicker(): void {
    this.pickerDay.set(null);
  }

  async addRecipe(recipe: RecipePreview): Promise<void> {
    const day = this.pickerDay();
    if (!day) return;
    this.plan.update((p) => ({ ...p, [day]: [...p[day], recipe.id] }));
    this.closePicker();
    await this.persist();
  }

  async removeRecipe(day: WeekDay, index: number): Promise<void> {
    this.plan.update((p) => ({ ...p, [day]: p[day].filter((_, i) => i !== index) }));
    await this.persist();
  }

  openRecipe(id: string): void {
    this.router.navigate(['/recipe', id]);
  }

  async addWeekToShopping(): Promise<void> {
    const ids = Object.values(this.plan()).flat();
    if (ids.length === 0) return;
    const ingredients = this.recipeService.findByIds(ids).flatMap((r) => r.ingredients);
    await this.firestoreService.addShoppingItems(ingredients);
    this.addedToShopping.set(true);
    setTimeout(() => this.addedToShopping.set(false), 2500);
  }

  private async persist(): Promise<void> {
    this.saving.set(true);
    await this.firestoreService.saveMealPlan(this.plan());
    this.saving.set(false);
  }
}

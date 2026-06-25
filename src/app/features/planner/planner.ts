import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../core/services/recipe';
import { MealPlanStore } from '../../core/stores/meal-plan.store';
import { ShoppingStore } from '../../core/stores/shopping.store';
import { NotificationService } from '../../core/services/notification';
import { RecipePreview, MealPlan, WeekDay } from '../../core/models/recipe.interface';
import { normalizeMealPlan, countPlannedMeals } from '../../core/utils/meal-plan';
import { onImageError } from '../../shared/image-fallback';

interface DayColumn {
  key: WeekDay;
  label: string;
  recipes: RecipePreview[];
}

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
  imports: [RouterLink],
  templateUrl: './planner.html',
  styleUrl: './planner.scss',
})
export class Planner implements OnInit {
  private recipeService = inject(RecipeService);
  private mealPlanStore = inject(MealPlanStore);
  private shoppingStore = inject(ShoppingStore);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  onImageError = onImageError;

  private plan = signal<MealPlan>(normalizeMealPlan());
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

  totalMeals = computed(() => countPlannedMeals(this.plan()));

  ngOnInit(): void {
    this.mealPlanStore
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((plan) => {
        if (plan) this.plan.set(normalizeMealPlan(plan));
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
    await this.shoppingStore.add(ingredients);
    this.addedToShopping.set(true);
    this.notification.success('Zutaten der Woche zur Einkaufsliste hinzugefügt');
    setTimeout(() => this.addedToShopping.set(false), 2500);
  }

  private async persist(): Promise<void> {
    this.saving.set(true);
    await this.mealPlanStore.save(this.plan());
    this.saving.set(false);
  }
}

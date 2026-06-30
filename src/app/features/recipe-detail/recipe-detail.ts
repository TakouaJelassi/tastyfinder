import { Component, inject, signal, OnInit, input, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';
import { RecipeService } from '../../core/services/recipe';
import { AiService } from '../../core/services/ai';
import { ShoppingStore } from '../../core/stores/shopping.store';
import { FavoriteStore } from '../../core/stores/favorite.store';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { Recipe } from '../../core/models/recipe.interface';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-recipe-detail',
  imports: [Icon],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail implements OnInit {
  id = input.required<string>();

  private recipeService = inject(RecipeService);
  private aiService = inject(AiService);
  private shoppingStore = inject(ShoppingStore);
  private favoriteStore = inject(FavoriteStore);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  recipe = signal<Recipe | null>(null);
  loading = signal(true);
  aiSummary = signal('');
  aiLoading = signal(false);
  addedToList = signal(false);
  favorite = signal(false);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  async addToShoppingList(): Promise<void> {
    const recipe = this.recipe();
    if (!recipe || !this.isLoggedIn) return;
    await this.shoppingStore.add(recipe.ingredients);
    this.addedToList.set(true);
    this.notification.success('Ingredients added to shopping list');
    setTimeout(() => this.addedToList.set(false), 2500);
  }

  async toggleFavorite(): Promise<void> {
    const recipe = this.recipe();
    if (!recipe || !this.isLoggedIn) return;

    if (this.favorite()) {
      await this.favoriteStore.remove(recipe.id);
      this.favorite.set(false);
      this.notification.info('Removed from favorites');
    } else {
      await this.favoriteStore.add(recipe.id);
      this.favorite.set(true);
      this.notification.success('Added to favorites');
    }
  }

  ngOnInit(): void {
    this.recipeService
      .getById(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((recipe) => {
        this.recipe.set(recipe);
        this.loading.set(false);
        if (recipe) {
          this.loadAiSummary(recipe);
          this.favoriteStore
            .isFavorite(recipe.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((isFavorite) => {
              this.favorite.set(isFavorite);
            });
        }
      });
  }

  goBack(): void {
    this.location.back();
  }

  getYoutubeUrl(url: string): SafeResourceUrl {
    let id = '';
    try {
      const parsed = new URL(url);
      id = parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop() ?? '';
    } catch {}
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }

  get difficulty(): string {
    const minutes = this.recipe()?.readyInMinutes ?? 0;
    if (minutes <= 25) return 'Easy';
    if (minutes <= 50) return 'Medium';
    return 'Challenging';
  }

  get instructionSteps(): string[] {
    const instructions = this.recipe()?.instructions ?? '';
    return instructions
      .replace(/<[^>]+>/g, ' ')
      .split(/(?:\.\s+|\n+)/)
      .map((step) => step.trim())
      .filter(Boolean)
      .map((step) => (step.endsWith('.') ? step : `${step}.`));
  }

  private async loadAiSummary(recipe: Recipe): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.aiLoading.set(true);
    const summary = await this.aiService.summarizeRecipe(recipe.title, recipe.instructions);
    this.aiSummary.set(summary);
    this.aiLoading.set(false);
  }
}

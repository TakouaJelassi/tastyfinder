import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RecipeService } from '../../core/services/recipe';
import { AiService } from '../../core/services/ai';
import { FirestoreService } from '../../core/services/firestore';
import { AuthService } from '../../core/services/auth';
import { Recipe } from '../../core/models/recipe.interface';

@Component({
  selector: 'app-recipe-detail',
  imports: [],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail implements OnInit {
  id = input.required<string>();

  private recipeService = inject(RecipeService);
  private aiService = inject(AiService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);

  recipe = signal<Recipe | null>(null);
  loading = signal(true);
  aiSummary = signal('');
  aiLoading = signal(false);
  addedToList = signal(false);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  async addToShoppingList(): Promise<void> {
    const recipe = this.recipe();
    if (!recipe || !this.isLoggedIn) return;
    await this.firestoreService.addShoppingItems(recipe.ingredients);
    this.addedToList.set(true);
    setTimeout(() => this.addedToList.set(false), 2500);
  }

  ngOnInit(): void {
    this.recipeService.getById(this.id()).subscribe((recipe) => {
      this.recipe.set(recipe);
      this.loading.set(false);
      if (recipe) this.loadAiSummary(recipe);
    });
  }

  goBack(): void {
    this.location.back();
  }

  getYoutubeUrl(url: string): SafeResourceUrl {
    const id = url?.split('v=')?.[1] ?? '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }

  private async loadAiSummary(recipe: Recipe): Promise<void> {
    this.aiLoading.set(true);
    const summary = await this.aiService.summarizeRecipe(recipe.title, recipe.instructions);
    this.aiSummary.set(summary);
    this.aiLoading.set(false);
  }
}

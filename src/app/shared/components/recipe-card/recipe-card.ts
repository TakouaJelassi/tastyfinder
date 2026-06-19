import { Component, input, output, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { RecipePreview } from '../../../core/models/recipe.interface';

@Component({
  selector: 'app-recipe-card',
  imports: [],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard {
  recipe = input.required<RecipePreview>();
  favoriteToggled = output<string>();

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isFavorite(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const favs: string[] = JSON.parse(localStorage.getItem('favorites') ?? '[]');
    return favs.includes(this.recipe().idMeal);
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    if (!isPlatformBrowser(this.platformId)) return;
    const favs: string[] = JSON.parse(localStorage.getItem('favorites') ?? '[]');
    const id = this.recipe().idMeal;
    const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    localStorage.setItem('favorites', JSON.stringify(updated));
    this.favoriteToggled.emit(id);
  }

  openDetail(): void {
    this.router.navigate(['/recipe', this.recipe().idMeal]);
  }
}

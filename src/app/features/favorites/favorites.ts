import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { RecipeService } from '../../core/services/recipe';
import { RecipePreview } from '../../core/models/recipe.interface';
import { RecipeCard } from '../../shared/components/recipe-card/recipe-card';

@Component({
  selector: 'app-favorites',
  imports: [RecipeCard],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites implements OnInit {
  private recipeService = inject(RecipeService);
  private platformId = inject(PLATFORM_ID);

  recipes = signal<RecipePreview[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    const ids: string[] = JSON.parse(localStorage.getItem('favorites') ?? '[]');

    if (ids.length === 0) {
      this.loading.set(false);
      return;
    }

    const requests = ids.map(id =>
      this.recipeService.getById(id)
    );

    forkJoin(requests).subscribe(results => {
      const previews: RecipePreview[] = results
        .filter(r => r !== null)
        .map(r => ({
          idMeal: r!.idMeal,
          strMeal: r!.strMeal,
          strMealThumb: r!.strMealThumb,
        }));
      this.recipes.set(previews);
      this.loading.set(false);
    });
  }

  onFavoriteToggled(id: string): void {
    this.recipes.update(list => list.filter(r => r.idMeal !== id));
  }
}

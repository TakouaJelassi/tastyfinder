import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { RecipeService } from '../../core/services/recipe';
import { FirestoreService } from '../../core/services/firestore';
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
  private firestoreService = inject(FirestoreService);

  recipes = signal<RecipePreview[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.firestoreService.getFavoriteIds().subscribe((ids) => {
      if (ids.length === 0) {
        this.recipes.set([]);
        this.loading.set(false);
        return;
      }

      const requests = ids.map((id) => this.recipeService.getById(id));
      forkJoin(requests).subscribe((results) => {
        const previews: RecipePreview[] = results
          .filter((r) => r !== null)
          .map((r) => ({
            idMeal: r!.idMeal,
            strMeal: r!.strMeal,
            strMealThumb: r!.strMealThumb,
          }));
        this.recipes.set(previews);
        this.loading.set(false);
      });
    });
  }

  onFavoriteToggled(id: string): void {
    this.recipes.update((list) => list.filter((r) => r.idMeal !== id));
  }
}

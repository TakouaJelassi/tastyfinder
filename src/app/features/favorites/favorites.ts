import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RecipeService } from '../../core/services/recipe';
import { FavoriteStore } from '../../core/stores/favorite.store';
import { RecipePreview } from '../../core/models/recipe.interface';
import { RecipeCard } from '../../shared/components/recipe-card/recipe-card';

@Component({
  selector: 'app-favorites',
  imports: [RecipeCard, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites implements OnInit {
  private recipeService = inject(RecipeService);
  private favoriteStore = inject(FavoriteStore);
  private destroyRef = inject(DestroyRef);

  recipes = signal<RecipePreview[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.favoriteStore
      .ids()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ids) => {
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
              id: r!.id,
              title: r!.title,
              image: r!.image,
            }));
          this.recipes.set(previews);
          this.loading.set(false);
        });
      });
  }

  onFavoriteToggled(id: string): void {
    this.recipes.update((list) => list.filter((r) => r.id !== id));
  }
}

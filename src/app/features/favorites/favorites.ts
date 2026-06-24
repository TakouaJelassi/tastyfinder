import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
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
  private destroyRef = inject(DestroyRef);

  recipes = signal<RecipePreview[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.firestoreService
      .getFavoriteIds()
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

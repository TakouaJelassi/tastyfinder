import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserRecipeStore } from '../../core/stores/user-recipe.store';
import { GeneratedRecipe } from '../../core/models/generated-recipe.interface';

@Component({
  selector: 'app-library',
  imports: [RouterLink],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library implements OnInit {
  private userRecipeStore = inject(UserRecipeStore);
  private destroyRef = inject(DestroyRef);

  recipes = signal<GeneratedRecipe[]>([]);
  loading = signal(true);
  expandedId = signal<string | null>(null);

  ngOnInit(): void {
    this.userRecipeStore
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((recipes) => {
        this.recipes.set(recipes);
        this.loading.set(false);
      });
  }

  toggleExpand(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }
}

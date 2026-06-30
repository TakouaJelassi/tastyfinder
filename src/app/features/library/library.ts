import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserRecipeStore } from '../../core/stores/user-recipe.store';
import { NotificationService } from '../../core/services/notification';
import { GeneratedRecipe } from '../../core/models/generated-recipe.interface';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-library',
  imports: [RouterLink, Icon],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library implements OnInit {
  private userRecipeStore = inject(UserRecipeStore);
  private notification = inject(NotificationService);
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

  async deleteRecipe(recipe: GeneratedRecipe, event: Event): Promise<void> {
    event.stopPropagation();
    if (!recipe.id) return;
    const backup = this.recipes();
    this.recipes.update((list) => list.filter((r) => r.id !== recipe.id));
    if (this.expandedId() === recipe.id) this.expandedId.set(null);
    try {
      await this.userRecipeStore.delete(recipe.id);
      this.notification.success('Recipe removed from library');
    } catch {
      this.recipes.set(backup);
      this.notification.error('Failed to remove recipe. Please try again.');
    }
  }
}

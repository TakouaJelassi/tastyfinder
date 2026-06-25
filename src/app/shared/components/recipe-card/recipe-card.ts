import { Component, input, output, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { RecipePreview } from '../../../core/models/recipe.interface';
import { FavoriteStore } from '../../../core/stores/favorite.store';
import { AuthService } from '../../../core/services/auth';
import { onImageError } from '../../image-fallback';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-recipe-card',
  imports: [Icon],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard implements OnInit {
  recipe = input.required<RecipePreview>();
  favoriteToggled = output<string>();

  private router = inject(Router);
  private favoriteStore = inject(FavoriteStore);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isFavorite = signal(false);
  onImageError = onImageError;

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) return;
    this.favoriteStore
      .isFavorite(this.recipe().id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.isFavorite.set(val);
      });
  }

  async toggleFavorite(event: Event): Promise<void> {
    event.stopPropagation();
    if (!this.authService.isLoggedIn) return;
    const id = this.recipe().id;
    if (this.isFavorite()) {
      await this.favoriteStore.remove(id);
      this.isFavorite.set(false);
    } else {
      await this.favoriteStore.add(id);
      this.isFavorite.set(true);
    }
    this.favoriteToggled.emit(id);
  }

  openDetail(): void {
    this.router.navigate(['/recipe', this.recipe().id]);
  }
}

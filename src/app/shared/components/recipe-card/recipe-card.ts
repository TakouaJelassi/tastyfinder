import { Component, input, output, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { RecipePreview } from '../../../core/models/recipe.interface';
import { FirestoreService } from '../../../core/services/firestore';
import { AuthService } from '../../../core/services/auth';
import { onImageError } from '../../image-fallback';

@Component({
  selector: 'app-recipe-card',
  imports: [],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard implements OnInit {
  recipe = input.required<RecipePreview>();
  favoriteToggled = output<string>();

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isFavorite = signal(false);
  onImageError = onImageError;

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) return;
    this.firestoreService
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
      await this.firestoreService.removeFavorite(id);
      this.isFavorite.set(false);
    } else {
      await this.firestoreService.addFavorite(id);
      this.isFavorite.set(true);
    }
    this.favoriteToggled.emit(id);
  }

  openDetail(): void {
    this.router.navigate(['/recipe', this.recipe().id]);
  }
}

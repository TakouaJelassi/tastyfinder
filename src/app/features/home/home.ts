import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { RecipeService } from '../../core/services/recipe';
import { RecipePreview, Category } from '../../core/models/recipe.interface';
import { RecipeCard } from '../../shared/components/recipe-card/recipe-card';
import { SkeletonLoader } from '../../shared/components/skeleton-loader/skeleton-loader';
import { onImageError } from '../../shared/image-fallback';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, RecipeCard, SkeletonLoader],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private recipeService = inject(RecipeService);
  private destroyRef = inject(DestroyRef);

  searchTerm = signal('');
  recipes = signal<RecipePreview[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal('');
  loading = signal(true);
  onImageError = onImageError;

  /** "Rezept des Tages" — dominante Bento-Kachel (erstes geladenes Rezept). */
  featured = computed(() => this.recipes()[0] ?? null);
  /** Kleine Bento-Kacheln: erste vier Küchen als Schnellfilter. */
  quickCategories = computed(() => this.categories().slice(0, 4));
  /** Bento nur in der Entdecken-Ansicht zeigen (nicht beim Suchen/Filtern). */
  showBento = computed(() => !this.searchTerm() && !this.selectedCategory());

  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.loadInitial();
    this.loadCategories();

    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term: string) => {
          this.loading.set(true);
          return term ? this.recipeService.search(term) : this.recipeService.search('');
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results: RecipePreview[]) => {
        this.recipes.set(results);
        this.loading.set(false);
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.selectedCategory.set('');
    this.search$.next(term);
  }

  onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
    this.loading.set(true);
    this.recipeService.getByCategory(category).subscribe((results: RecipePreview[]) => {
      this.recipes.set(results);
      this.loading.set(false);
    });
  }

  private loadInitial(): void {
    this.recipeService.search('').subscribe((results: RecipePreview[]) => {
      this.recipes.set(results);
      this.loading.set(false);
    });
  }

  private loadCategories(): void {
    this.recipeService.getCategories().subscribe((cats) => {
      this.categories.set(cats);
    });
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { RecipeService } from '../../core/services/recipe';
import { RecipePreview, Category } from '../../core/models/recipe.interface';
import { RecipeCard } from '../../shared/components/recipe-card/recipe-card';
import { SkeletonLoader } from '../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RecipeCard, SkeletonLoader],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private recipeService = inject(RecipeService);

  searchTerm = signal('');
  recipes = signal<RecipePreview[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal('');
  loading = signal(true);

  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.loadInitial();
    this.loadCategories();

    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => {
        this.loading.set(true);
        return term
          ? this.recipeService.searchByName(term)
          : this.recipeService.searchByName('chicken');
      })
    ).subscribe(results => {
      this.recipes.set(results);
      this.loading.set(false);
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.search$.next(term);
  }

  onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
    this.loading.set(true);
    this.recipeService.getByCategory(category).subscribe(results => {
      this.recipes.set(results);
      this.loading.set(false);
    });
  }

  private loadInitial(): void {
    this.recipeService.searchByName('chicken').subscribe(results => {
      this.recipes.set(results);
      this.loading.set(false);
    });
  }

  private loadCategories(): void {
    this.recipeService.getCategories().subscribe(cats => {
      this.categories.set(cats);
    });
  }
}

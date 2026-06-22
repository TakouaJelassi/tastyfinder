import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../core/services/firestore';
import { GeneratedRecipe } from '../../core/models/generated-recipe.interface';

@Component({
  selector: 'app-library',
  imports: [RouterLink],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library implements OnInit {
  private firestoreService = inject(FirestoreService);

  recipes = signal<GeneratedRecipe[]>([]);
  loading = signal(true);
  expandedId = signal<string | null>(null);

  ngOnInit(): void {
    this.firestoreService.getRecipes().subscribe((recipes) => {
      this.recipes.set(recipes);
      this.loading.set(false);
    });
  }

  toggleExpand(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }
}

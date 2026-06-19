import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'recipe/:id', loadComponent: () => import('./features/recipe-detail/recipe-detail').then(m => m.RecipeDetail) },
  { path: 'favorites', loadComponent: () => import('./features/favorites/favorites').then(m => m.Favorites) },
  { path: 'chat', loadComponent: () => import('./features/chatbot/chatbot').then(m => m.Chatbot) },
  { path: '**', redirectTo: 'home' },
];

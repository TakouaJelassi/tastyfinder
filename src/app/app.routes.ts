import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/auth').then((m) => m.AuthPage) },
  { path: 'home', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
  {
    path: 'recipe/:id',
    loadComponent: () =>
      import('./features/recipe-detail/recipe-detail').then((m) => m.RecipeDetail),
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites').then((m) => m.Favorites),
    canActivate: [authGuard],
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chatbot/chatbot').then((m) => m.Chatbot),
    canActivate: [authGuard],
  },
  {
    path: 'generate',
    loadComponent: () => import('./features/generate/generate').then((m) => m.Generate),
    canActivate: [authGuard],
  },
  {
    path: 'library',
    loadComponent: () => import('./features/library/library').then((m) => m.Library),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'home' },
];

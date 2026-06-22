import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'recipe/:id', renderMode: RenderMode.Server },
  { path: 'generate', renderMode: RenderMode.Client },
  { path: 'library', renderMode: RenderMode.Client },
  { path: 'chat', renderMode: RenderMode.Client },
  { path: 'favorites', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];

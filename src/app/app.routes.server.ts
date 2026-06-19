import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'recipe/:id', renderMode: RenderMode.Server },
  { path: 'generate', renderMode: RenderMode.Server },
  { path: 'library', renderMode: RenderMode.Server },
  { path: 'chat', renderMode: RenderMode.Server },
  { path: 'favorites', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender }
];

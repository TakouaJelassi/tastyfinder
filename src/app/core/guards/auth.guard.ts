import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);
  const router = inject(Router);

  // During SSR there is no auth session — skip redirect; browser will re-check.
  if (!isPlatformBrowser(platformId)) return true;

  // Wait for the first Firebase auth emission before redirecting (prevents login flash on reload).
  await auth.ready;

  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/login']);
};

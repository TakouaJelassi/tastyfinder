import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);
  const router = inject(Router);

  // Serverseitig (SSR/Prerender) gibt es keine Auth-Session → nicht umleiten,
  // die echte Prüfung erfolgt im Browser.
  if (!isPlatformBrowser(platformId)) return true;

  // Auf den ersten Auth-Status von Firebase warten (sonst Redirect beim Reload)
  await auth.ready;

  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/login']);
};

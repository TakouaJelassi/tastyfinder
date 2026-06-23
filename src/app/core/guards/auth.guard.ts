import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Auf den ersten Auth-Status von Firebase warten (sonst Redirect beim Reload)
  await auth.ready;

  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/login']);
};

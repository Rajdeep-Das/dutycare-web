import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

/**
 * Guards a route by role. SuperAdmin passes any role check.
 * Usage: canActivate: [authGuard, roleGuard(['Doctor'])]
 */
export function roleGuard(allowed: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.user()?.role;

    if (role && (role === 'SuperAdmin' || allowed.includes(role))) {
      return true;
    }
    return router.createUrlTree(['/login']);
  };
}

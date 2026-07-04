import { UserRole } from './auth.service';

/** Landing route for a role after login (Plan §3). */
export function landingRouteForRole(role: UserRole): string {
  switch (role) {
    case 'Doctor':
      return '/doctor';
    case 'Police':
      return '/police';
    case 'SuperAdmin':
      return '/admin';
  }
}

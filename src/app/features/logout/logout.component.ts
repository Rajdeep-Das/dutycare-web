import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Clears the session and redirects to login. Reachable at /logout so it can be
 * hit directly (testing) or linked from a logout button.
 */
@Component({
  selector: 'app-logout',
  standalone: true,
  template: '',
})
export class LogoutComponent {
  constructor() {
    const auth = inject(AuthService);
    const router = inject(Router);
    auth.logout();
    router.navigateByUrl('/login');
  }
}

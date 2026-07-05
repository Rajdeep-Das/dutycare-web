import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { landingRouteForRole } from '../../core/auth/role-redirect';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { DsInputDirective } from '../../shared/design-system/form/ds-input.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonComponent, DsInputDirective],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Already logged in? Skip straight to the role's landing page.
    const role = this.auth.user()?.role;
    if (role) {
      this.router.navigateByUrl(landingRouteForRole(role));
    }
  }

  protected submit(): void {
    if (this.loading()) return;
    this.error.set(null);
    this.loading.set(true);

    this.authApi.login({ username: this.username(), password: this.password() }).subscribe({
      next: (res) => {
        try {
          this.auth.setSession(res.token);
        } catch {
          this.loading.set(false);
          this.error.set('Could not sign in. Please try again.');
          return;
        }
        const role = this.auth.user()!.role;
        this.router.navigateByUrl(landingRouteForRole(role));
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.status === 401
            ? 'Invalid username or password.'
            : 'Could not sign in. Please try again.',
        );
      },
    });
  }
}

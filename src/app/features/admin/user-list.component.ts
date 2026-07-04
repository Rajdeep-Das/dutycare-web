import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UserRole } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { AdminApiService, AdminUser, CreateUserRequest } from './admin-api.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private readonly adminApi = inject(AdminApiService);
  private readonly auth = inject(AuthService);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly currentUsername = this.auth.user()?.username ?? '';

  // Create form
  protected readonly showCreate = signal(false);
  protected readonly newUsername = signal('');
  protected readonly newPassword = signal('');
  protected readonly newRole = signal<UserRole>('Doctor');
  protected readonly creating = signal(false);
  protected readonly createError = signal<string | null>(null);

  protected readonly canCreate = computed(
    () => this.newUsername().trim().length > 0 && this.newPassword().length > 0,
  );

  constructor() {
    this.reload();
  }

  private reload(): void {
    this.loading.set(true);
    this.adminApi.list().subscribe({
      next: (u) => {
        this.users.set(u);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected toggleCreate(): void {
    this.showCreate.update((v) => !v);
    this.createError.set(null);
  }

  protected create(): void {
    if (this.creating() || !this.canCreate()) return;
    this.creating.set(true);
    this.createError.set(null);

    const body: CreateUserRequest = {
      username: this.newUsername().trim(),
      password: this.newPassword(),
      role: this.newRole(),
    };
    this.adminApi.create(body).subscribe({
      next: () => {
        this.newUsername.set('');
        this.newPassword.set('');
        this.newRole.set('Doctor');
        this.creating.set(false);
        this.showCreate.set(false);
        this.reload();
      },
      error: (err) => {
        this.creating.set(false);
        this.createError.set(
          err?.status === 409
            ? 'That username is already taken.'
            : 'Could not create the user. Please try again.',
        );
      },
    });
  }

  protected toggleStatus(user: AdminUser): void {
    this.adminApi.setStatus(user.id, !user.isActive).subscribe({
      next: (updated) =>
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u))),
    });
  }

  protected isSelf(user: AdminUser): boolean {
    return user.username === this.currentUsername;
  }
}

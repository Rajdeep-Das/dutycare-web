import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'Doctor' | 'Police' | 'SuperAdmin';

export interface AuthUser {
  username: string;
  role: UserRole;
}

const TOKEN_KEY = 'dutycare.token';

/**
 * Holds the JWT and decoded user. Wiring to POST /api/auth/login comes in the
 * Auth phase; this is the shell the guards and interceptor depend on.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<AuthUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  get token(): string | null {
    return this._token();
  }

  setSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
    this._user.set(user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._user.set(null);
  }
}

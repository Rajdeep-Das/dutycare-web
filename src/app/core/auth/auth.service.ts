import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'Doctor' | 'Police' | 'SuperAdmin';

export interface AuthUser {
  username: string;
  role: UserRole;
}

const TOKEN_KEY = 'dutycare.token';

// Claim URIs used by ASP.NET Core when serializing ClaimTypes.Name / .Role.
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

/**
 * Holds the JWT and derived user. The token is the single source of truth: the
 * user (username + role) is decoded from the token payload, both on construction
 * (so a hard refresh keeps the session and role) and on login.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<AuthUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  constructor() {
    // Rehydrate the user from a persisted, still-valid token on startup.
    const token = this._token();
    if (token) {
      const user = AuthService.decode(token);
      if (user) {
        this._user.set(user);
      } else {
        this.logout(); // expired or malformed — clear it
      }
    }
  }

  get token(): string | null {
    return this._token();
  }

  setSession(token: string): void {
    const user = AuthService.decode(token);
    if (!user) {
      throw new Error('Received an invalid or expired token from login.');
    }
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
    this._user.set(user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  /** Decodes a JWT payload into an AuthUser, or null if invalid/expired. */
  private static decode(token: string): AuthUser | null {
    try {
      // JWT parts are base64url (-, _, no padding); atob needs standard base64.
      let b64 = (token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const payload = JSON.parse(atob(b64));

      const exp = payload['exp'] as number | undefined;
      if (exp && exp * 1000 <= Date.now()) {
        return null; // expired
      }

      const username = (payload[NAME_CLAIM] ?? payload['name'] ?? payload['unique_name']) as string | undefined;
      const role = (payload[ROLE_CLAIM] ?? payload['role']) as UserRole | undefined;

      if (!username || !role) {
        return null;
      }
      return { username, role };
    } catch {
      return null;
    }
  }
}

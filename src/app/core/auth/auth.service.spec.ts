import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

// Helper: build an unsigned HS256-shaped JWT with the ASP.NET Core claim URIs.
// Signature is irrelevant to client-side decode; we only read the payload.
function makeToken(payload: Record<string, unknown>): string {
  const b64url = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.sig`;
}

const NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const future = Math.floor(Date.now() / 1000) + 3600;
const past = Math.floor(Date.now() / 1000) - 3600;

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  function service(): AuthService {
    return TestBed.inject(AuthService);
  }

  it('decodes a valid token into user via setSession', () => {
    const token = makeToken({ [NAME]: 'admin', [ROLE]: 'SuperAdmin', exp: future });
    const svc = service();
    svc.setSession(token);
    expect(svc.user()).toEqual({ username: 'admin', role: 'SuperAdmin' });
    expect(svc.isAuthenticated()).toBeTrue();
  });

  it('handles a real base64url token containing - or _ characters', () => {
    // A genuine backend token whose signature part contains "-"; the payload
    // reader must normalize base64url before atob.
    const realToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZTVjODIwZi04Yzk2LTQ3ZjQtODg3Mi0wMzY1ZmY2ODA3NDMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW4iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTdXBlckFkbWluIiwiZXhwIjoxNzgzMjY5NzIwLCJpc3MiOiJEdXR5Q2FyZSIsImF1ZCI6IkR1dHlDYXJlIiwiaWF0IjoxNzgzMTgzMzIwLCJuYmYiOjE3ODMxODMzMjB9.9UhUEtGfumab-kXdBkcfPUUmSXODelHmbxW7XQ0wO7I';
    const svc = service();
    svc.setSession(realToken);
    expect(svc.user()).toEqual({ username: 'admin', role: 'SuperAdmin' });
  });

  it('rehydrates the user from a persisted token on construction (survives refresh)', () => {
    localStorage.setItem(
      'dutycare.token',
      makeToken({ [NAME]: 'doc1', [ROLE]: 'Doctor', exp: future }),
    );
    const svc = service();
    expect(svc.user()).toEqual({ username: 'doc1', role: 'Doctor' });
    expect(svc.isAuthenticated()).toBeTrue();
  });

  it('rejects and clears an expired persisted token', () => {
    localStorage.setItem(
      'dutycare.token',
      makeToken({ [NAME]: 'x', [ROLE]: 'Police', exp: past }),
    );
    const svc = service();
    expect(svc.user()).toBeNull();
    expect(svc.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('dutycare.token')).toBeNull();
  });

  it('throws from setSession on a malformed token', () => {
    const svc = service();
    expect(() => svc.setSession('not.a.jwt')).toThrow();
  });

  it('logout clears session and storage', () => {
    const svc = service();
    svc.setSession(makeToken({ [NAME]: 'a', [ROLE]: 'Doctor', exp: future }));
    svc.logout();
    expect(svc.user()).toBeNull();
    expect(localStorage.getItem('dutycare.token')).toBeNull();
  });
});

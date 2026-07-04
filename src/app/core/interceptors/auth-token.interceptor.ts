import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/** Attaches the bearer token to same-origin /api requests. */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token;
  if (token && req.url.startsWith('/api')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

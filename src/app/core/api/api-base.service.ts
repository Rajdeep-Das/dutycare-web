import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Thin wrapper over HttpClient. All calls are same-origin against /api, which
 * Vercel rewrites to the backend (Plan section 2) so no CORS is needed.
 */
@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<T>(`${this.base}${path}`, { params: this.toParams(params) });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`);
  }

  private toParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return httpParams;
  }
}

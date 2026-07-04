import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

/** Talks to /api/auth (Plan §7). */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiBaseService);

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', body);
  }
}

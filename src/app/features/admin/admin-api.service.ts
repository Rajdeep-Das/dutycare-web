import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../core/api/api-base.service';
import { UserRole } from '../../core/auth/auth.service';

export interface AdminUser {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: UserRole;
}

/** Admin user management (Plan §7). SuperAdmin only. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly api = inject(ApiBaseService);
  private readonly base = '/admin/users';

  list(): Observable<AdminUser[]> {
    return this.api.get<AdminUser[]>(this.base);
  }

  create(body: CreateUserRequest): Observable<AdminUser> {
    return this.api.post<AdminUser>(this.base, body);
  }

  setStatus(id: string, isActive: boolean): Observable<AdminUser> {
    return this.api.put<AdminUser>(`${this.base}/${id}/status`, { isActive });
  }
}

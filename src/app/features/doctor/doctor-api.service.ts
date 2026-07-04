import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../core/api/api-base.service';
import {
  Activity,
  ActivityCreateRequest,
  ActivityImage,
  ActivityListItem,
  ActivityUpdateRequest,
  PagedResult,
  ShareLink,
} from './doctor.models';

/** Doctor module endpoints (Plan §7). */
@Injectable({ providedIn: 'root' })
export class DoctorApiService {
  private readonly api = inject(ApiBaseService);
  private readonly http = inject(HttpClient);
  private readonly base = '/doctor/activities';

  search(filters: Record<string, string>): Observable<PagedResult<ActivityListItem>> {
    return this.api.get<PagedResult<ActivityListItem>>(`${this.base}/search`, filters);
  }

  get(id: string): Observable<Activity> {
    return this.api.get<Activity>(`${this.base}/${id}`);
  }

  create(body: ActivityCreateRequest): Observable<Activity> {
    return this.api.post<Activity>(this.base, body);
  }

  update(id: string, body: ActivityUpdateRequest): Observable<Activity> {
    return this.api.put<Activity>(`${this.base}/${id}`, body);
  }

  uploadImage(id: string, blob: Blob): Observable<ActivityImage> {
    const form = new FormData();
    form.append('file', blob, 'photo.jpg');
    // Same-origin /api; auth interceptor adds the bearer token.
    return this.http.post<ActivityImage>(`/api${this.base}/${id}/images`, form);
  }

  deleteImage(id: string, imageId: string): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}/images/${imageId}`);
  }

  createOrGetShareLink(id: string): Observable<ShareLink> {
    return this.api.post<ShareLink>(`${this.base}/${id}/share-link`, {});
  }

  /** Soft-deletes the activity (server sets DeletedAt). */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../core/api/api-base.service';
import {
  Case,
  CaseCreateRequest,
  CaseListItem,
  CasePerson,
  CasePersonPhone,
  CaseUpdateRequest,
  CaseVehicle,
  PagedResult,
  PersonRequest,
  VehicleRequest,
} from './police.models';

/** Police module endpoints (Plan §7). */
@Injectable({ providedIn: 'root' })
export class PoliceApiService {
  private readonly api = inject(ApiBaseService);
  private readonly http = inject(HttpClient);

  // ---- Cases ----
  search(filters: Record<string, string>): Observable<PagedResult<CaseListItem>> {
    return this.api.get<PagedResult<CaseListItem>>('/police/cases/search', filters);
  }
  getCase(id: string): Observable<Case> {
    return this.api.get<Case>(`/police/cases/${id}`);
  }
  createCase(body: CaseCreateRequest): Observable<Case> {
    return this.api.post<Case>('/police/cases', body);
  }
  updateCase(id: string, body: CaseUpdateRequest): Observable<Case> {
    return this.api.put<Case>(`/police/cases/${id}`, body);
  }

  // ---- Persons ----
  addPerson(caseId: string, body: PersonRequest): Observable<CasePerson> {
    return this.api.post<CasePerson>(`/police/cases/${caseId}/persons`, body);
  }
  updatePerson(personId: string, body: PersonRequest): Observable<CasePerson> {
    return this.api.put<CasePerson>(`/police/persons/${personId}`, body);
  }
  deletePerson(personId: string): Observable<void> {
    return this.api.delete<void>(`/police/persons/${personId}`);
  }
  setProfileImage(personId: string, blob: Blob): Observable<CasePerson> {
    const form = new FormData();
    form.append('file', blob, 'profile.jpg');
    return this.http.post<CasePerson>(`/api/police/persons/${personId}/profile-image`, form);
  }
  deleteProfileImage(personId: string): Observable<void> {
    return this.api.delete<void>(`/police/persons/${personId}/profile-image`);
  }

  // ---- Phones ----
  addPhone(personId: string, phoneNumber: string): Observable<CasePersonPhone> {
    return this.api.post<CasePersonPhone>(`/police/persons/${personId}/phones`, { phoneNumber });
  }
  deletePhone(phoneId: string): Observable<void> {
    return this.api.delete<void>(`/police/phones/${phoneId}`);
  }

  // ---- Vehicles ----
  addVehicle(caseId: string, body: VehicleRequest): Observable<CaseVehicle> {
    return this.api.post<CaseVehicle>(`/police/cases/${caseId}/vehicles`, body);
  }
  updateVehicle(vehicleId: string, body: VehicleRequest): Observable<CaseVehicle> {
    return this.api.put<CaseVehicle>(`/police/vehicles/${vehicleId}`, body);
  }
  deleteVehicle(vehicleId: string): Observable<void> {
    return this.api.delete<void>(`/police/vehicles/${vehicleId}`);
  }
}

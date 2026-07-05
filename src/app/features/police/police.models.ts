export type CaseStatus = 'Open' | 'UnderInvestigation' | 'Closed';
export type CasePersonType = 'Criminal' | 'Accused';

export interface CasePersonPhone {
  id: string;
  phoneNumber: string;
}

export interface CasePerson {
  id: string;
  firstName: string;
  lastName?: string;
  caseType: CasePersonType;
  profileImageUrl?: string | null;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  addressLine?: string;
  phones: CasePersonPhone[];
}

export interface CaseVehicle {
  id: string;
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  notes?: string;
}

export interface CaseListItem {
  id: string;
  caseNumber: string;
  caseNo?: string;
  caseDate: string;
  status: CaseStatus;
}

export interface Case extends CaseListItem {
  description?: string;
  createdAt: string;
  persons: CasePerson[];
  vehicles: CaseVehicle[];
}

export interface CaseCreateRequest {
  caseNo?: string;
  caseDate: string;
  status: CaseStatus;
  description?: string;
}
export type CaseUpdateRequest = CaseCreateRequest;

export interface PersonRequest {
  firstName: string;
  lastName?: string;
  caseType: CasePersonType;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  addressLine?: string;
}

export interface VehicleRequest {
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  notes?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  Open: 'Open',
  UnderInvestigation: 'Under investigation',
  Closed: 'Closed',
};

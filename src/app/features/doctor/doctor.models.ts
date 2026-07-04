export type ActivityType = 'InFacility' | 'OutReach';

export interface ActivityImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ActivityListItem {
  id: string;
  name: string;
  activityDate: string; // ISO date
  place?: string;
  type: ActivityType;
}

export interface Activity extends ActivityListItem {
  createdAt: string;
  images: ActivityImage[];
}

export interface ActivityCreateRequest {
  name: string;
  activityDate: string;
  place?: string;
  type: ActivityType;
}

export type ActivityUpdateRequest = ActivityCreateRequest;

export interface ShareLink {
  token: string;
  isActive: boolean;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

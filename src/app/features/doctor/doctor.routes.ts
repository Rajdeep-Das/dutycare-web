import { Routes } from '@angular/router';

export const doctorRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/activity-list.component').then((m) => m.ActivityListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./activity-create/activity-create.component').then((m) => m.ActivityCreateComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./activity-create/activity-create.component').then((m) => m.ActivityCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./activity-detail/activity-detail.component').then((m) => m.ActivityDetailComponent),
  },
];

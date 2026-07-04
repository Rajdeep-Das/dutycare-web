import { Routes } from '@angular/router';

export const doctorRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/activity-list.component').then((m) => m.ActivityListComponent),
  },
  // activity-detail, activity-create wired in the Doctor module phase.
];

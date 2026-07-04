import { Routes } from '@angular/router';

export const policeRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/case-list.component').then((m) => m.CaseListComponent),
  },
  // case-detail, case-create wired in the Police module phase.
];

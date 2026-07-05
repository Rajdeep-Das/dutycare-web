import { Routes } from '@angular/router';

export const policeRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/case-list.component').then((m) => m.CaseListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./case-create/case-create.component').then((m) => m.CaseCreateComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./case-create/case-create.component').then((m) => m.CaseCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./case-detail/case-detail.component').then((m) => m.CaseDetailComponent),
  },
];

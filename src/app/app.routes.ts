import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'logout',
    loadComponent: () =>
      import('./features/logout/logout.component').then((m) => m.LogoutComponent),
  },

  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard(['Doctor'])],
    loadChildren: () =>
      import('./features/doctor/doctor.routes').then((m) => m.doctorRoutes),
  },

  {
    path: 'police',
    canActivate: [authGuard, roleGuard(['Police'])],
    loadChildren: () =>
      import('./features/police/police.routes').then((m) => m.policeRoutes),
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['SuperAdmin'])],
    loadComponent: () =>
      import('./features/admin/user-list.component').then((m) => m.UserListComponent),
  },

  {
    // Public share view — no auth, no guard (Plan section 3).
    path: 'share/:token',
    loadComponent: () =>
      import('./features/public-share/share-view.component').then((m) => m.ShareViewComponent),
  },

  { path: '**', redirectTo: 'login' },
];

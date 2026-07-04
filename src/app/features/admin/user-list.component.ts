import { Component } from '@angular/core';

@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    <section class="p-4">
      <h1 class="text-xl font-semibold">Admin · Users</h1>
      <p class="mt-2 text-slate-500">User list and activate/deactivate — Admin phase.</p>
    </section>
  `,
})
export class UserListComponent {}

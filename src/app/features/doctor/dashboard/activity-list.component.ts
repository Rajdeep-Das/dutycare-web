import { Component } from '@angular/core';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  template: `
    <section class="p-4">
      <h1 class="text-xl font-semibold" style="color: var(--accent-doctor)">Doctor · Activities</h1>
      <p class="mt-2 text-slate-500">Activity list — Doctor module phase.</p>
    </section>
  `,
})
export class ActivityListComponent {}

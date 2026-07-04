import { Component } from '@angular/core';

@Component({
  selector: 'app-case-list',
  standalone: true,
  template: `
    <section class="p-4">
      <h1 class="text-xl font-semibold" style="color: var(--accent-police)">Police · Cases</h1>
      <p class="mt-2 text-slate-500">Case list — Police module phase.</p>
    </section>
  `,
})
export class CaseListComponent {}

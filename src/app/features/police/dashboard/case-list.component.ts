import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { EmptyStateComponent } from '../../../shared/design-system/empty-state/empty-state.component';
import { ListItemComponent } from '../../../shared/design-system/list-item/list-item.component';
import { PageHeaderComponent } from '../../../shared/design-system/page-header/page-header.component';
import { SearchFilterBarComponent } from '../../../shared/design-system/search-filter-bar/search-filter-bar.component';
import { FilterField, FilterValues } from '../../../shared/design-system/search-filter-bar/search-filter.model';
import { SkeletonListComponent } from '../../../shared/design-system/skeleton/skeleton-list.component';
import { PoliceApiService } from '../police-api.service';
import { CaseListItem, CASE_STATUS_LABELS } from '../police.models';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ButtonComponent,
    EmptyStateComponent,
    ListItemComponent,
    PageHeaderComponent,
    SearchFilterBarComponent,
    SkeletonListComponent,
  ],
  templateUrl: './case-list.component.html',
})
export class CaseListComponent {
  private readonly policeApi = inject(PoliceApiService);
  private readonly router = inject(Router);

  protected readonly cases = signal<CaseListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly showFilters = signal(false);
  protected readonly statusLabels = CASE_STATUS_LABELS;

  protected readonly filterFields: FilterField[] = [
    { key: 'case_number', label: 'Case number', type: 'text', placeholder: 'e.g. 2026-0001' },
    { key: 'case_no', label: 'FIR / external no.', type: 'text' },
    { key: 'person_name', label: 'Person name', type: 'text' },
    { key: 'vehicle_number', label: 'Vehicle number', type: 'text' },
    { key: 'district', label: 'District', type: 'text' },
    { key: 'case_date', label: 'Case date', type: 'date-range' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Open', label: 'Open' },
        { value: 'UnderInvestigation', label: 'Under investigation' },
        { value: 'Closed', label: 'Closed' },
      ],
    },
  ];

  constructor() {
    this.load({});
  }

  protected load(filters: FilterValues): void {
    this.loading.set(true);
    this.policeApi.search(filters).subscribe({
      next: (res) => {
        this.cases.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected open(id: string): void {
    this.router.navigate(['/police', id]);
  }

  protected create(): void {
    this.router.navigate(['/police', 'create']);
  }

  protected toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }
}

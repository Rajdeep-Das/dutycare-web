import { DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
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
    ReactiveFormsModule,
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

  /** Single search box: one free-text term, OR-matched server-side across
   * case number, FIR/external no., person name, vehicle number, district. */
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  private readonly query = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  /** Secondary refinement panel for filters a free-text box can't express. */
  protected readonly filterFields: FilterField[] = [
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
  private activeFilters: FilterValues = {};

  constructor() {
    effect(() => this.load(this.query()));
  }

  protected load(term: string): void {
    this.loading.set(true);
    const trimmed = term.trim();
    const params: FilterValues = { ...this.activeFilters };
    if (trimmed) params['q'] = trimmed;
    else delete params['q'];

    this.policeApi.search(params).subscribe({
      next: (res) => {
        this.cases.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Applies the advanced filter panel alongside the current search term. */
  protected applyFilters(filters: FilterValues): void {
    this.activeFilters = filters;
    this.load(this.searchControl.value);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
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

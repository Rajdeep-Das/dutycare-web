import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { EmptyStateComponent } from '../../../shared/design-system/empty-state/empty-state.component';
import { ListItemComponent } from '../../../shared/design-system/list-item/list-item.component';
import { SearchFilterBarComponent } from '../../../shared/design-system/search-filter-bar/search-filter-bar.component';
import { FilterField, FilterValues } from '../../../shared/design-system/search-filter-bar/search-filter.model';
import { DoctorApiService } from '../doctor-api.service';
import { ActivityListItem } from '../doctor.models';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [
    DatePipe,
    ButtonComponent,
    EmptyStateComponent,
    ListItemComponent,
    SearchFilterBarComponent,
  ],
  templateUrl: './activity-list.component.html',
})
export class ActivityListComponent {
  private readonly doctorApi = inject(DoctorApiService);
  private readonly router = inject(Router);

  protected readonly activities = signal<ActivityListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly showFilters = signal(false);

  protected readonly filterFields: FilterField[] = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Activity name' },
    { key: 'place', label: 'Place', type: 'text', placeholder: 'Place' },
    { key: 'date', label: 'Date', type: 'date-range' },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'InFacility', label: 'In-facility' },
        { value: 'OutReach', label: 'Outreach' },
      ],
    },
  ];

  constructor() {
    this.load({});
  }

  protected load(filters: FilterValues): void {
    this.loading.set(true);
    this.doctorApi.search(filters).subscribe({
      next: (res) => {
        this.activities.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected open(id: string): void {
    this.router.navigate(['/doctor', id]);
  }

  protected create(): void {
    this.router.navigate(['/doctor', 'create']);
  }

  protected toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }
}

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
import { SkeletonListComponent } from '../../../shared/design-system/skeleton/skeleton-list.component';
import { DoctorApiService } from '../doctor-api.service';
import { ActivityListItem } from '../doctor.models';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    EmptyStateComponent,
    ListItemComponent,
    PageHeaderComponent,
    SkeletonListComponent,
  ],
  templateUrl: './activity-list.component.html',
})
export class ActivityListComponent {
  private readonly doctorApi = inject(DoctorApiService);
  private readonly router = inject(Router);

  protected readonly activities = signal<ActivityListItem[]>([]);
  protected readonly loading = signal(true);

  /** Single Google-Photos-style search box. */
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  /** Debounced search term, driven by the input. */
  private readonly query = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  constructor() {
    // Re-run the search whenever the debounced query changes (incl. the initial load).
    effect(() => this.load(this.query()));
  }

  protected load(term: string): void {
    this.loading.set(true);
    const trimmed = term.trim();
    // One free-text param — the backend matches broadly (name, place, …).
    const params: Record<string, string> = trimmed ? { q: trimmed } : {};
    this.doctorApi.search(params).subscribe({
      next: (res) => {
        this.activities.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
  }

  protected open(id: string): void {
    this.router.navigate(['/doctor', id]);
  }

  protected create(): void {
    this.router.navigate(['/doctor', 'create']);
  }
}

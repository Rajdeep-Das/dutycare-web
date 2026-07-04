import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { DoctorApiService } from '../doctor-api.service';
import { ActivityType } from '../doctor.models';

/** Handles both create (/doctor/create) and edit (/doctor/:id/edit). */
@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './activity-create.component.html',
})
export class ActivityCreateComponent {
  private readonly doctorApi = inject(DoctorApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly editId = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = computed(() => this.editId !== null);

  protected readonly name = signal('');
  protected readonly activityDate = signal(new Date().toISOString().slice(0, 10));
  protected readonly place = signal('');
  protected readonly type = signal<ActivityType>('OutReach');
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    if (this.editId) {
      this.doctorApi.get(this.editId).subscribe({
        next: (a) => {
          this.name.set(a.name);
          this.activityDate.set(a.activityDate.slice(0, 10));
          this.place.set(a.place ?? '');
          this.type.set(a.type);
        },
        error: () => this.error.set('Could not load the activity.'),
      });
    }
  }

  protected save(): void {
    if (this.saving() || !this.name() || !this.activityDate()) return;
    this.saving.set(true);
    this.error.set(null);

    const body = {
      name: this.name(),
      activityDate: this.activityDate(),
      place: this.place() || undefined,
      type: this.type(),
    };

    const request$ = this.editId
      ? this.doctorApi.update(this.editId, body)
      : this.doctorApi.create(body);

    request$.subscribe({
      next: (a) => this.router.navigate(['/doctor', a.id]),
      error: () => {
        this.saving.set(false);
        this.error.set('Could not save. Please try again.');
      },
    });
  }

  protected cancel(): void {
    this.router.navigate(this.editId ? ['/doctor', this.editId] : ['/doctor', 'dashboard']);
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { DoctorApiService } from '../doctor-api.service';
import { ActivityType } from '../doctor.models';

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './activity-create.component.html',
})
export class ActivityCreateComponent {
  private readonly doctorApi = inject(DoctorApiService);
  private readonly router = inject(Router);

  protected readonly name = signal('');
  protected readonly activityDate = signal(new Date().toISOString().slice(0, 10));
  protected readonly place = signal('');
  protected readonly type = signal<ActivityType>('OutReach');
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected save(): void {
    if (this.saving() || !this.name() || !this.activityDate()) return;
    this.saving.set(true);
    this.error.set(null);

    this.doctorApi
      .create({
        name: this.name(),
        activityDate: this.activityDate(),
        place: this.place() || undefined,
        type: this.type(),
      })
      .subscribe({
        next: (a) => this.router.navigate(['/doctor', a.id]),
        error: () => {
          this.saving.set(false);
          this.error.set('Could not save. Please try again.');
        },
      });
  }

  protected cancel(): void {
    this.router.navigate(['/doctor', 'dashboard']);
  }
}

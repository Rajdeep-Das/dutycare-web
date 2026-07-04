import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityType } from '../doctor/doctor.models';

interface PublicActivity {
  name: string;
  activityDate: string;
  place?: string;
  type: ActivityType;
  images: { url: string; sortOrder: number }[];
}

@Component({
  selector: 'app-share-view',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './share-view.component.html',
})
export class ShareViewComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  protected readonly activity = signal<PublicActivity | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);

  protected readonly typeLabel = computed(() =>
    this.activity()?.type === 'InFacility' ? 'In-facility' : 'Outreach',
  );

  constructor() {
    const token = this.route.snapshot.paramMap.get('token');
    this.http.get<PublicActivity>(`/api/public/share/${token}`).subscribe({
      next: (a) => {
        this.activity.set(a);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }
}

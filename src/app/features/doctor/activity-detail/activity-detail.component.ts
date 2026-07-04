import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { CardComponent } from '../../../shared/design-system/card/card.component';
import { ImageUploaderComponent, PreparedImage } from '../../../shared/design-system/image-uploader/image-uploader.component';
import { DoctorApiService } from '../doctor-api.service';
import { Activity } from '../doctor.models';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [DatePipe, ButtonComponent, CardComponent, ImageUploaderComponent],
  templateUrl: './activity-detail.component.html',
})
export class ActivityDetailComponent {
  private readonly doctorApi = inject(DoctorApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly activity = signal<Activity | null>(null);
  protected readonly loading = signal(true);
  protected readonly uploading = signal(false);
  protected readonly shareUrl = signal<string | null>(null);
  protected readonly sharing = signal(false);

  protected readonly typeLabel = computed(() =>
    this.activity()?.type === 'InFacility' ? 'In-facility' : 'Outreach',
  );

  constructor() {
    this.reload();
  }

  private reload(): void {
    this.doctorApi.get(this.id).subscribe({
      next: (a) => {
        this.activity.set(a);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onPrepared(image: PreparedImage): void {
    this.uploading.set(true);
    this.doctorApi.uploadImage(this.id, image.blob).subscribe({
      next: () => {
        URL.revokeObjectURL(image.previewUrl);
        this.uploading.set(false);
        this.reload();
      },
      error: () => {
        URL.revokeObjectURL(image.previewUrl);
        this.uploading.set(false);
      },
    });
  }

  protected removeImage(imageId: string): void {
    this.doctorApi.deleteImage(this.id, imageId).subscribe(() => this.reload());
  }

  protected share(): void {
    this.sharing.set(true);
    this.doctorApi.createOrGetShareLink(this.id).subscribe({
      next: (link) => {
        this.shareUrl.set(`${location.origin}/share/${link.token}`);
        this.sharing.set(false);
      },
      error: () => this.sharing.set(false),
    });
  }

  protected async copyShare(): Promise<void> {
    const url = this.shareUrl();
    if (url) await navigator.clipboard.writeText(url);
  }

  protected back(): void {
    this.router.navigate(['/doctor', 'dashboard']);
  }
}

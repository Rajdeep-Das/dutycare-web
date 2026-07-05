import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { CardComponent } from '../../../shared/design-system/card/card.component';
import { ImageUploaderComponent, PreparedImage } from '../../../shared/design-system/image-uploader/image-uploader.component';
import { DsInputDirective } from '../../../shared/design-system/form/ds-input.directive';
import { PageHeaderComponent } from '../../../shared/design-system/page-header/page-header.component';
import QRCode from 'qrcode';
import { DoctorApiService } from '../doctor-api.service';
import { Activity } from '../doctor.models';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [DatePipe, ButtonComponent, CardComponent, ImageUploaderComponent, PageHeaderComponent, DsInputDirective],
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
  protected readonly qrDataUrl = signal<string | null>(null);
  protected readonly sharing = signal(false);
  // Probe file-share support with an actual (empty) PNG File so the button
  // label is honest — desktop Chrome exposes canShare() but rejects files.
  protected readonly canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([], 'probe.png', { type: 'image/png' })] });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);

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
        const url = `${location.origin}/share/${link.token}`;
        this.shareUrl.set(url);
        // Generate the QR entirely client-side — the token is a credential
        // for the unauthenticated /share route and must not leave the browser.
        QRCode.toDataURL(url, { width: 240, margin: 1 })
          .then((dataUrl) => this.qrDataUrl.set(dataUrl))
          .catch(() => this.qrDataUrl.set(null));
        this.sharing.set(false);
      },
      error: () => this.sharing.set(false),
    });
  }

  protected async copyShare(): Promise<void> {
    const url = this.shareUrl();
    if (url) await navigator.clipboard.writeText(url);
  }

  /** Share the QR image via the native share sheet (mobile), where supported. */
  protected async shareQr(): Promise<void> {
    const dataUrl = this.qrDataUrl();
    if (!dataUrl) return;
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'dutycare-share-qr.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'DutyCare',
          text: 'Scan to open the shared activity.',
        });
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
    } else {
      this.downloadQr();
    }
  }

  /** Desktop fallback: download the QR image so the user can share it manually. */
  protected downloadQr(): void {
    const dataUrl = this.qrDataUrl();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'dutycare-share-qr.png';
    a.click();
  }

  protected edit(): void {
    this.router.navigate(['/doctor', this.id, 'edit']);
  }

  protected confirmDelete(): void {
    this.confirmingDelete.set(true);
  }

  protected cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  protected doDelete(): void {
    this.deleting.set(true);
    this.doctorApi.delete(this.id).subscribe({
      next: () => this.router.navigate(['/doctor', 'dashboard']),
      error: () => this.deleting.set(false),
    });
  }

  protected back(): void {
    this.router.navigate(['/doctor', 'dashboard']);
  }
}

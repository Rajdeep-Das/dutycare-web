import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { CardComponent } from '../../../shared/design-system/card/card.component';
import { DsInputDirective } from '../../../shared/design-system/form/ds-input.directive';
import { ImageUploaderComponent, PreparedImage } from '../../../shared/design-system/image-uploader/image-uploader.component';
import { PageHeaderComponent } from '../../../shared/design-system/page-header/page-header.component';
import { PoliceApiService } from '../police-api.service';
import { Case, CasePerson, CasePersonType, CaseStatus, CASE_STATUS_LABELS } from '../police.models';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ButtonComponent,
    CardComponent,
    DsInputDirective,
    ImageUploaderComponent,
    PageHeaderComponent,
  ],
  templateUrl: './case-detail.component.html',
})
export class CaseDetailComponent {
  private readonly policeApi = inject(PoliceApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly caseData = signal<Case | null>(null);
  protected readonly loading = signal(true);
  protected readonly statusLabels = CASE_STATUS_LABELS;

  // Add-person form
  protected readonly showPersonForm = signal(false);
  protected readonly pFirst = signal('');
  protected readonly pLast = signal('');
  protected readonly pType = signal<CasePersonType>('Accused');
  protected readonly pDistrict = signal('');
  protected readonly pAddress = signal('');
  protected readonly savingPerson = signal(false);

  // Add-vehicle form
  protected readonly showVehicleForm = signal(false);
  protected readonly vReg = signal('');
  protected readonly vMake = signal('');
  protected readonly vColor = signal('');
  protected readonly savingVehicle = signal(false);

  // Per-person phone input + profile-image upload state
  protected readonly phoneDrafts = signal<Record<string, string>>({});
  protected readonly uploadingPhotoFor = signal<string | null>(null);

  protected readonly statusLabel = computed(() => {
    const s = this.caseData()?.status;
    return s ? CASE_STATUS_LABELS[s] : '';
  });

  constructor() {
    this.reload();
  }

  private reload(): void {
    this.policeApi.getCase(this.id).subscribe({
      next: (c) => {
        this.caseData.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected statusBadgeClass(status: CaseStatus): string {
    return {
      Open: 'bg-police-soft text-police',
      UnderInvestigation: 'bg-warning/10 text-warning',
      Closed: 'bg-neutral-100 text-neutral-500',
    }[status];
  }

  // ---- Person ----
  protected togglePersonForm(): void {
    this.showPersonForm.update((v) => !v);
  }
  protected addPerson(): void {
    if (this.savingPerson() || !this.pFirst()) return;
    this.savingPerson.set(true);
    this.policeApi
      .addPerson(this.id, {
        firstName: this.pFirst(),
        lastName: this.pLast() || undefined,
        caseType: this.pType(),
        district: this.pDistrict() || undefined,
        addressLine: this.pAddress() || undefined,
      })
      .subscribe({
        next: () => {
          this.pFirst.set('');
          this.pLast.set('');
          this.pDistrict.set('');
          this.pAddress.set('');
          this.pType.set('Accused');
          this.savingPerson.set(false);
          this.showPersonForm.set(false);
          this.reload();
        },
        error: () => this.savingPerson.set(false),
      });
  }
  protected deletePerson(personId: string): void {
    this.policeApi.deletePerson(personId).subscribe(() => this.reload());
  }

  // ---- Phones ----
  protected phoneDraft(personId: string): string {
    return this.phoneDrafts()[personId] ?? '';
  }
  protected setPhoneDraft(personId: string, value: string): void {
    this.phoneDrafts.update((d) => ({ ...d, [personId]: value }));
  }
  protected addPhone(person: CasePerson): void {
    const number = this.phoneDraft(person.id).trim();
    if (!number) return;
    this.policeApi.addPhone(person.id, number).subscribe(() => {
      this.setPhoneDraft(person.id, '');
      this.reload();
    });
  }
  protected deletePhone(phoneId: string): void {
    this.policeApi.deletePhone(phoneId).subscribe(() => this.reload());
  }

  // ---- Profile image ----
  protected onProfilePrepared(personId: string, image: PreparedImage): void {
    this.uploadingPhotoFor.set(personId);
    this.policeApi.setProfileImage(personId, image.blob).subscribe({
      next: () => {
        URL.revokeObjectURL(image.previewUrl);
        this.uploadingPhotoFor.set(null);
        this.reload();
      },
      error: () => {
        URL.revokeObjectURL(image.previewUrl);
        this.uploadingPhotoFor.set(null);
      },
    });
  }
  protected removeProfileImage(personId: string): void {
    this.policeApi.deleteProfileImage(personId).subscribe(() => this.reload());
  }

  // ---- Vehicle ----
  protected toggleVehicleForm(): void {
    this.showVehicleForm.update((v) => !v);
  }
  protected addVehicle(): void {
    if (this.savingVehicle() || !this.vReg()) return;
    this.savingVehicle.set(true);
    this.policeApi
      .addVehicle(this.id, {
        registrationNumber: this.vReg(),
        make: this.vMake() || undefined,
        color: this.vColor() || undefined,
      })
      .subscribe({
        next: () => {
          this.vReg.set('');
          this.vMake.set('');
          this.vColor.set('');
          this.savingVehicle.set(false);
          this.showVehicleForm.set(false);
          this.reload();
        },
        error: () => this.savingVehicle.set(false),
      });
  }
  protected deleteVehicle(vehicleId: string): void {
    this.policeApi.deleteVehicle(vehicleId).subscribe(() => this.reload());
  }

  protected vehicleDetail(v: { make?: string; model?: string; color?: string }): string {
    return [v.make, v.model, v.color].filter(Boolean).join(' · ');
  }

  // ---- Nav ----
  protected edit(): void {
    this.router.navigate(['/police', this.id, 'edit']);
  }
  protected back(): void {
    this.router.navigate(['/police', 'dashboard']);
  }
}

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
import { Case, CasePerson, CasePersonType, CaseStatus, CASE_STATUS_LABELS, PersonRequest, VehicleRequest } from '../police.models';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

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

  // Page-level error banner (delete/reload failures with no dedicated form)
  protected readonly actionError = signal<string | null>(null);

  // Add/edit-person form ('' = closed, 'new' = adding, personId = editing that person)
  protected readonly personFormMode = signal<'new' | string | null>(null);
  protected readonly pFirst = signal('');
  protected readonly pLast = signal('');
  protected readonly pType = signal<CasePersonType>('Accused');
  protected readonly pVillage = signal('');
  protected readonly pPostOffice = signal('');
  protected readonly pPoliceStation = signal('');
  protected readonly pDistrict = signal('');
  protected readonly pAddress = signal('');
  protected readonly savingPerson = signal(false);
  protected readonly personError = signal<string | null>(null);

  // Add/edit-vehicle form ('' = closed, 'new' = adding, vehicleId = editing that vehicle)
  protected readonly vehicleFormMode = signal<'new' | string | null>(null);
  protected readonly vReg = signal('');
  protected readonly vMake = signal('');
  protected readonly vModel = signal('');
  protected readonly vColor = signal('');
  protected readonly vNotes = signal('');
  protected readonly savingVehicle = signal(false);
  protected readonly vehicleError = signal<string | null>(null);

  // Per-person phone input + profile-image upload state
  protected readonly phoneDrafts = signal<Record<string, string>>({});
  protected readonly uploadingPhotoFor = signal<string | null>(null);
  protected readonly busyPersonId = signal<string | null>(null);
  protected readonly busyPhoneId = signal<string | null>(null);
  protected readonly busyVehicleId = signal<string | null>(null);

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
      error: () => {
        this.loading.set(false);
        this.actionError.set('Could not load this case.');
      },
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
  protected addPersonForm(): void {
    this.pFirst.set('');
    this.pLast.set('');
    this.pType.set('Accused');
    this.pVillage.set('');
    this.pPostOffice.set('');
    this.pPoliceStation.set('');
    this.pDistrict.set('');
    this.pAddress.set('');
    this.personError.set(null);
    this.personFormMode.set('new');
  }
  protected editPersonForm(p: CasePerson): void {
    this.pFirst.set(p.firstName);
    this.pLast.set(p.lastName ?? '');
    this.pType.set(p.caseType);
    this.pVillage.set(p.village ?? '');
    this.pPostOffice.set(p.postOffice ?? '');
    this.pPoliceStation.set(p.policeStation ?? '');
    this.pDistrict.set(p.district ?? '');
    this.pAddress.set(p.addressLine ?? '');
    this.personError.set(null);
    this.personFormMode.set(p.id);
  }
  protected closePersonForm(): void {
    this.personFormMode.set(null);
  }
  protected savePerson(): void {
    if (this.savingPerson() || !this.pFirst()) return;
    this.savingPerson.set(true);
    this.personError.set(null);

    const body: PersonRequest = {
      firstName: this.pFirst(),
      lastName: this.pLast() || undefined,
      caseType: this.pType(),
      village: this.pVillage() || undefined,
      postOffice: this.pPostOffice() || undefined,
      policeStation: this.pPoliceStation() || undefined,
      district: this.pDistrict() || undefined,
      addressLine: this.pAddress() || undefined,
    };
    const mode = this.personFormMode();
    const request$ =
      mode && mode !== 'new'
        ? this.policeApi.updatePerson(mode, body)
        : this.policeApi.addPerson(this.id, body);

    request$.subscribe({
      next: () => {
        this.savingPerson.set(false);
        this.personFormMode.set(null);
        this.reload();
      },
      error: () => {
        this.savingPerson.set(false);
        this.personError.set(GENERIC_ERROR);
      },
    });
  }
  protected deletePerson(personId: string): void {
    if (this.busyPersonId() || !confirm('Remove this person? This cannot be undone.')) return;
    this.actionError.set(null);
    this.busyPersonId.set(personId);
    this.policeApi.deletePerson(personId).subscribe({
      next: () => {
        this.busyPersonId.set(null);
        this.reload();
      },
      error: () => {
        this.busyPersonId.set(null);
        this.actionError.set('Could not remove this person. Please try again.');
      },
    });
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
    if (!number || this.busyPersonId()) return;
    this.actionError.set(null);
    this.busyPersonId.set(person.id);
    this.policeApi.addPhone(person.id, number).subscribe({
      next: () => {
        this.setPhoneDraft(person.id, '');
        this.busyPersonId.set(null);
        this.reload();
      },
      error: () => {
        this.busyPersonId.set(null);
        this.actionError.set('Could not add this phone number. Please try again.');
      },
    });
  }
  protected deletePhone(phoneId: string): void {
    if (this.busyPhoneId() || !confirm('Remove this phone number?')) return;
    this.actionError.set(null);
    this.busyPhoneId.set(phoneId);
    this.policeApi.deletePhone(phoneId).subscribe({
      next: () => {
        this.busyPhoneId.set(null);
        this.reload();
      },
      error: () => {
        this.busyPhoneId.set(null);
        this.actionError.set('Could not remove this phone number. Please try again.');
      },
    });
  }

  // ---- Profile image ----
  protected onProfilePrepared(personId: string, image: PreparedImage): void {
    this.actionError.set(null);
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
        this.actionError.set('Could not upload this photo. Please try again.');
      },
    });
  }
  protected removeProfileImage(personId: string): void {
    if (this.busyPersonId() || !confirm('Remove this photo?')) return;
    this.actionError.set(null);
    this.busyPersonId.set(personId);
    this.policeApi.deleteProfileImage(personId).subscribe({
      next: () => {
        this.busyPersonId.set(null);
        this.reload();
      },
      error: () => {
        this.busyPersonId.set(null);
        this.actionError.set('Could not remove this photo. Please try again.');
      },
    });
  }

  // ---- Vehicle ----
  protected addVehicleForm(): void {
    this.vReg.set('');
    this.vMake.set('');
    this.vModel.set('');
    this.vColor.set('');
    this.vNotes.set('');
    this.vehicleError.set(null);
    this.vehicleFormMode.set('new');
  }
  protected editVehicleForm(v: { id: string; registrationNumber: string; make?: string; model?: string; color?: string; notes?: string }): void {
    this.vReg.set(v.registrationNumber);
    this.vMake.set(v.make ?? '');
    this.vModel.set(v.model ?? '');
    this.vColor.set(v.color ?? '');
    this.vNotes.set(v.notes ?? '');
    this.vehicleError.set(null);
    this.vehicleFormMode.set(v.id);
  }
  protected closeVehicleForm(): void {
    this.vehicleFormMode.set(null);
  }
  protected saveVehicle(): void {
    if (this.savingVehicle() || !this.vReg()) return;
    this.savingVehicle.set(true);
    this.vehicleError.set(null);

    const body: VehicleRequest = {
      registrationNumber: this.vReg(),
      make: this.vMake() || undefined,
      model: this.vModel() || undefined,
      color: this.vColor() || undefined,
      notes: this.vNotes() || undefined,
    };
    const mode = this.vehicleFormMode();
    const request$ =
      mode && mode !== 'new'
        ? this.policeApi.updateVehicle(mode, body)
        : this.policeApi.addVehicle(this.id, body);

    request$.subscribe({
      next: () => {
        this.savingVehicle.set(false);
        this.vehicleFormMode.set(null);
        this.reload();
      },
      error: () => {
        this.savingVehicle.set(false);
        this.vehicleError.set(GENERIC_ERROR);
      },
    });
  }
  protected deleteVehicle(vehicleId: string): void {
    if (this.busyVehicleId() || !confirm('Remove this vehicle? This cannot be undone.')) return;
    this.actionError.set(null);
    this.busyVehicleId.set(vehicleId);
    this.policeApi.deleteVehicle(vehicleId).subscribe({
      next: () => {
        this.busyVehicleId.set(null);
        this.reload();
      },
      error: () => {
        this.busyVehicleId.set(null);
        this.actionError.set('Could not remove this vehicle. Please try again.');
      },
    });
  }

  protected vehicleDetail(v: { make?: string; model?: string; color?: string }): string {
    return [v.make, v.model, v.color].filter(Boolean).join(' · ');
  }

  protected personDetail(p: CasePerson): string {
    return [p.addressLine, p.village, p.postOffice, p.policeStation, p.district].filter(Boolean).join(', ');
  }

  // ---- Nav ----
  protected edit(): void {
    this.router.navigate(['/police', this.id, 'edit']);
  }
  protected back(): void {
    this.router.navigate(['/police', 'dashboard']);
  }
}

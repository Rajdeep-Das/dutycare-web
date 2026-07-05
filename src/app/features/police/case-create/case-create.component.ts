import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { DsInputDirective } from '../../../shared/design-system/form/ds-input.directive';
import { PageHeaderComponent } from '../../../shared/design-system/page-header/page-header.component';
import { PoliceApiService } from '../police-api.service';
import { CaseStatus } from '../police.models';

/** Handles create (/police/create) and edit (/police/:id/edit). */
@Component({
  selector: 'app-case-create',
  standalone: true,
  imports: [FormsModule, ButtonComponent, DsInputDirective, PageHeaderComponent],
  templateUrl: './case-create.component.html',
})
export class CaseCreateComponent {
  private readonly policeApi = inject(PoliceApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly editId = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = computed(() => this.editId !== null);

  protected readonly caseNo = signal('');
  protected readonly caseDate = signal(new Date().toISOString().slice(0, 10));
  protected readonly status = signal<CaseStatus>('Open');
  protected readonly description = signal('');
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    if (this.editId) {
      this.policeApi.getCase(this.editId).subscribe({
        next: (c) => {
          this.caseNo.set(c.caseNo ?? '');
          this.caseDate.set(c.caseDate.slice(0, 10));
          this.status.set(c.status);
          this.description.set(c.description ?? '');
        },
        error: () => this.error.set('Could not load the case.'),
      });
    }
  }

  protected save(): void {
    if (this.saving() || !this.caseDate()) return;
    this.saving.set(true);
    this.error.set(null);

    const body = {
      caseNo: this.caseNo() || undefined,
      caseDate: this.caseDate(),
      status: this.status(),
      description: this.description() || undefined,
    };
    const request$ = this.editId
      ? this.policeApi.updateCase(this.editId, body)
      : this.policeApi.createCase(body);

    request$.subscribe({
      next: (c) => this.router.navigate(['/police', c.id]),
      error: () => {
        this.saving.set(false);
        this.error.set('Could not save. Please try again.');
      },
    });
  }

  protected cancel(): void {
    this.router.navigate(this.editId ? ['/police', this.editId] : ['/police', 'dashboard']);
  }
}

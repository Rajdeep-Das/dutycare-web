import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { DsInputDirective } from '../form/ds-input.directive';
import { FilterField, FilterValues } from './search-filter.model';

/**
 * Renders a config-driven set of filter inputs (Plan §5, §11) and emits a flat
 * query-param map on search. date-range fields expand to `${key}_from` /
 * `${key}_to`; empty values are omitted so the backend only sees active filters.
 */
@Component({
  selector: 'ds-search-filter-bar',
  standalone: true,
  imports: [FormsModule, DsInputDirective, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="emitSearch()" class="space-y-3">
      @for (field of fields(); track field.key) {
        <div>
          <label class="block mb-1.5 text-body font-medium text-neutral-700">{{ field.label }}</label>

          @switch (field.type) {
            @case ('text') {
              <input dsInput type="text"
                [placeholder]="field.placeholder ?? ''"
                [ngModel]="value(field.key)"
                (ngModelChange)="set(field.key, $event)"
                [name]="field.key" />
            }
            @case ('select') {
              <select dsInput
                [ngModel]="value(field.key)"
                (ngModelChange)="set(field.key, $event)"
                [name]="field.key">
                <option value="">Any</option>
                @for (opt of field.options; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            }
            @case ('date-range') {
              <div class="flex gap-2">
                <input dsInput type="date"
                  [ngModel]="value(field.key + '_from')"
                  (ngModelChange)="set(field.key + '_from', $event)"
                  [name]="field.key + '_from'" />
                <input dsInput type="date"
                  [ngModel]="value(field.key + '_to')"
                  (ngModelChange)="set(field.key + '_to', $event)"
                  [name]="field.key + '_to'" />
              </div>
            }
          }
        </div>
      }

      <div class="grid grid-cols-2 gap-2 pt-1">
        <ds-button label="Search" type="submit" />
        <ds-button label="Clear" variant="secondary" (pressed)="reset()" />
      </div>
    </form>
  `,
})
export class SearchFilterBarComponent {
  readonly fields = input.required<FilterField[]>();

  /** Emits only non-empty params. */
  readonly search = output<FilterValues>();

  private readonly values = signal<FilterValues>({});

  protected value(key: string): string {
    return this.values()[key] ?? '';
  }

  protected set(key: string, val: string): void {
    this.values.update((v) => ({ ...v, [key]: val }));
  }

  protected reset(): void {
    this.values.set({});
    this.search.emit({});
  }

  protected emitSearch(): void {
    const active: FilterValues = {};
    for (const [key, val] of Object.entries(this.values())) {
      if (val !== '') active[key] = val;
    }
    this.search.emit(active);
  }
}

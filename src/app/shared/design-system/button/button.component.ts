import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'doctor' | 'police';
export type ButtonType = 'button' | 'submit';

/**
 * The one button used everywhere (Plan §12). Full-width by default because
 * screens are mobile-first; set [block]="false" for inline use.
 */
@Component({
  selector: 'ds-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="pressed.emit()"
    >
      @if (loading()) {
        <svg
          class="animate-spin -ml-0.5 mr-1 w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
          />
        </svg>
        {{ loadingLabel() }}
      } @else {
        {{ label() }}
      }
    </button>
  `,
})
export class ButtonComponent {
  readonly label = input.required<string>();
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly loadingLabel = input('Please wait…');
  readonly block = input(true);

  readonly pressed = output<void>();

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-1 rounded-md px-4 py-2.5 font-medium ' +
      'shadow-xs transition-all duration-150 active:scale-[0.98] ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none';
    const width = this.block() ? 'w-full' : '';
    const variant = {
      primary: 'bg-primary text-white hover:bg-primary-dark',
      secondary:
        'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400',
      danger: 'bg-error text-white hover:brightness-95',
      doctor: 'bg-doctor text-white hover:brightness-95',
      police: 'bg-police text-white hover:brightness-95',
    }[this.variant()];
    return [base, width, variant].filter(Boolean).join(' ');
  });
}

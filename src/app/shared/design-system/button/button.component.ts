import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
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
      {{ loading() ? loadingLabel() : label() }}
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
      'inline-flex items-center justify-center rounded-md px-4 py-2.5 font-medium ' +
      'transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ' +
      'focus-visible:ring-2 focus-visible:ring-offset-1';
    const width = this.block() ? 'w-full' : '';
    const variant = {
      primary: 'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary',
      secondary:
        'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus-visible:ring-neutral-300',
      danger: 'bg-error text-white hover:opacity-90 focus-visible:ring-error',
    }[this.variant()];
    return [base, width, variant].filter(Boolean).join(' ');
  });
}

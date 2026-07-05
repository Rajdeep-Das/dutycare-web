import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type HeaderAccent = 'default' | 'doctor' | 'police';

/**
 * The one app header, replacing the per-screen hand-rolled headers. Sticky,
 * with an optional back button, an accent-colored title, and a projected
 * actions slot on the right:
 *
 *   <ds-page-header title="Activities" accent="doctor" [back]="false">
 *     <button dsHeaderAction>…</button>
 *   </ds-page-header>
 */
@Component({
  selector: 'ds-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-neutral-200"
    >
      <div class="max-w-lg mx-auto flex items-center gap-2 px-4 h-14">
        @if (back()) {
          <button
            type="button"
            (click)="backClick.emit()"
            aria-label="Back"
            class="-ml-1.5 shrink-0 w-9 h-9 flex items-center justify-center rounded-lg
                   text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        }

        <h1 [class]="titleClasses()">{{ title() }}</h1>

        <div class="ml-auto flex items-center gap-1">
          <ng-content select="[dsHeaderAction]" />
        </div>
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly back = input(false);
  readonly accent = input<HeaderAccent>('default');

  readonly backClick = output<void>();

  protected readonly titleClasses = computed(() => {
    const color = {
      default: 'text-neutral-900',
      doctor: 'text-doctor',
      police: 'text-police',
    }[this.accent()];
    return `min-w-0 truncate text-title font-semibold ${color}`;
  });
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * A tappable row for lists (activities, cases — Plan §11). Title is required;
 * subtitle/meta are optional. Emits `selected` on tap. Content projection slots:
 *   [dsListItemLeading]  — optional leading visual (e.g. thumbnail)
 *   [dsListItemTrailing] — optional trailing visual (e.g. chevron, status)
 */
@Component({
  selector: 'ds-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="selected.emit()"
      class="group w-full flex items-center gap-3 text-left bg-white px-4 py-3.5
             transition-colors hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none"
    >
      <ng-content select="[dsListItemLeading]" />

      <span class="flex-1 min-w-0">
        <span class="block truncate font-medium text-neutral-900">{{ title() }}</span>
        @if (subtitle()) {
          <span class="block truncate text-neutral-500 text-body">{{ subtitle() }}</span>
        }
      </span>

      @if (meta()) {
        <span class="shrink-0 text-neutral-400 text-caption font-medium tabular-nums">{{ meta() }}</span>
      }
      <ng-content select="[dsListItemTrailing]" />

      <svg
        class="shrink-0 w-4 h-4 text-neutral-300 group-hover:text-neutral-400 transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  `,
})
export class ListItemComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly meta = input<string>();

  readonly selected = output<void>();
}

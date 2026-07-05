import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * A tappable row for lists (activities, cases — Plan §11). Title is required;
 * subtitle/meta are optional. Emits `selected` on tap. Content projection slots:
 *   [dsListItemLeading]  — optional leading visual (e.g. thumbnail)
 *   [dsListItemTrailing] — optional trailing visual (e.g. chevron, status)
 * Pass `index` (0-based position in the list) to get zebra striping —
 * odd rows get a subtle tinted background, like an alternating table.
 */
@Component({
  selector: 'ds-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="selected.emit()"
      [class]="rowClasses()"
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
  readonly index = input<number>(0);

  readonly selected = output<void>();

  protected readonly rowClasses = computed(() => {
    const base =
      'group w-full flex items-center gap-3 text-left px-4 py-3.5 ' +
      'transition-colors hover:bg-neutral-100 active:bg-neutral-200 focus:outline-none';
    const zebra = this.index() % 2 === 1 ? 'bg-neutral-50' : 'bg-white';
    return `${base} ${zebra}`;
  });
}

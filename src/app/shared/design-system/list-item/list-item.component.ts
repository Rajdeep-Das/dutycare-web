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
      class="w-full flex items-center gap-3 text-left bg-white border-b border-neutral-100
             px-4 py-3 active:bg-neutral-50 focus:outline-none focus-visible:bg-neutral-50"
    >
      <ng-content select="[dsListItemLeading]" />

      <span class="flex-1 min-w-0">
        <span class="block truncate font-medium text-neutral-900">{{ title() }}</span>
        @if (subtitle()) {
          <span class="block truncate text-neutral-500">{{ subtitle() }}</span>
        }
      </span>

      @if (meta()) {
        <span class="shrink-0 text-neutral-500">{{ meta() }}</span>
      }
      <ng-content select="[dsListItemTrailing]" />
    </button>
  `,
})
export class ListItemComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly meta = input<string>();

  readonly selected = output<void>();
}

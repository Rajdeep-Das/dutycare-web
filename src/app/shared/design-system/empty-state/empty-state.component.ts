import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shown when a list or search has no results (Plan §12). Optional projected
 * content (e.g. a "Create" button) renders under the message.
 */
@Component({
  selector: 'ds-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center text-center px-6 py-12">
      <p class="font-medium text-neutral-700 text-subtitle">{{ title() }}</p>
      @if (message()) {
        <p class="mt-1 text-neutral-500 max-w-xs">{{ message() }}</p>
      }
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input<string>();
}

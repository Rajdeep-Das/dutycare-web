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
    <div class="flex flex-col items-center justify-center text-center px-6 py-16">
      <div
        class="mb-4 w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400"
      >
        <ng-content select="[dsEmptyIcon]" />
        <svg
          class="w-6 h-6 dsempty-fallback-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 13h6m-3-3v6M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <p class="font-semibold text-neutral-800 text-subtitle">{{ title() }}</p>
      @if (message()) {
        <p class="mt-1.5 text-neutral-500 max-w-xs leading-relaxed">{{ message() }}</p>
      }
      <div class="mt-5">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    // Hide the default icon when the caller projects their own via [dsEmptyIcon].
    `:host ::ng-deep [dsEmptyIcon] + .dsempty-fallback-icon { display: none; }`,
  ],
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input<string>();
}

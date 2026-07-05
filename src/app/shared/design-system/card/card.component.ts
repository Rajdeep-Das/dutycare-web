import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Surface container used to group content (Plan §12). Content is projected. */
@Component({
  selector: 'ds-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl bg-white border border-neutral-200 shadow-sm p-5">
      <ng-content />
    </div>
  `,
})
export class CardComponent {}

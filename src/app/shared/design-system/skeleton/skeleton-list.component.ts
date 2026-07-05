import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Shimmering placeholder rows shown while a list loads. */
@Component({
  selector: 'ds-skeleton-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="divide-y divide-neutral-100">
      @for (row of rows(); track row) {
        <div class="flex items-center gap-3 px-4 py-3.5">
          <div class="flex-1 min-w-0 space-y-2">
            <div class="ds-skeleton h-3.5" [style.width]="row.titleWidth"></div>
            <div class="ds-skeleton h-3" [style.width]="row.subWidth"></div>
          </div>
          <div class="ds-skeleton h-3 w-12"></div>
        </div>
      }
    </div>
  `,
})
export class SkeletonListComponent {
  readonly count = input(5);

  // Varied widths so the placeholder reads as content, not a grid.
  protected rows() {
    const widths = [
      { titleWidth: '62%', subWidth: '40%' },
      { titleWidth: '48%', subWidth: '55%' },
      { titleWidth: '70%', subWidth: '33%' },
      { titleWidth: '54%', subWidth: '46%' },
      { titleWidth: '60%', subWidth: '38%' },
    ];
    return Array.from({ length: this.count() }, (_, i) => widths[i % widths.length]);
  }
}

import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityType } from '../doctor/doctor.models';

interface ShareImage {
  url: string;
  sortOrder: number;
}

interface PublicActivity {
  name: string;
  activityDate: string;
  place?: string;
  type: ActivityType;
  images: ShareImage[];
}

const MAX_ZOOM = 4;
const MIN_ZOOM = 1;

@Component({
  selector: 'app-share-view',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './share-view.component.html',
  styleUrl: './share-view.component.scss',
})
export class ShareViewComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  protected readonly activity = signal<PublicActivity | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);

  protected readonly typeLabel = computed(() =>
    this.activity()?.type === 'InFacility' ? 'In-facility' : 'Outreach',
  );

  protected readonly images = computed(() => this.activity()?.images ?? []);

  // --- Lightbox state ---
  /** Index of the currently open photo, or null when the lightbox is closed. */
  protected readonly openIndex = signal<number | null>(null);
  protected readonly zoom = signal(1);
  /** Pan offset (px) applied while zoomed in. */
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);

  protected readonly currentImage = computed(() => {
    const i = this.openIndex();
    return i === null ? null : (this.images()[i] ?? null);
  });

  protected readonly isZoomed = computed(() => this.zoom() > MIN_ZOOM);

  /** Live horizontal offset (px) while swiping between photos (not zoomed). */
  protected readonly swipeX = signal(0);
  /** True while a swipe is in progress, so the image follows the finger without transition. */
  protected readonly swiping = signal(false);

  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private panStartX = 0;
  private panStartY = 0;

  // Swipe-to-navigate (only when not zoomed).
  private swipeActive = false;
  private swipeStartX = 0;
  private swipeStartY = 0;
  /** px of horizontal travel past which a swipe commits to prev/next. */
  private static readonly SWIPE_THRESHOLD = 60;

  constructor() {
    const token = this.route.snapshot.paramMap.get('token');
    this.http.get<PublicActivity>(`/api/public/share/${token}`).subscribe({
      next: (a) => {
        a.images = [...a.images].sort((x, y) => x.sortOrder - y.sortOrder);
        this.activity.set(a);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  // --- Open / close ---
  protected open(index: number): void {
    this.openIndex.set(index);
    this.resetZoom();
    document.body.style.overflow = 'hidden';
  }

  protected close(): void {
    this.openIndex.set(null);
    document.body.style.overflow = '';
  }

  // --- Navigation ---
  protected next(): void {
    const i = this.openIndex();
    if (i === null) return;
    this.openIndex.set((i + 1) % this.images().length);
    this.resetZoom();
  }

  protected prev(): void {
    const i = this.openIndex();
    if (i === null) return;
    this.openIndex.set((i - 1 + this.images().length) % this.images().length);
    this.resetZoom();
  }

  // --- Zoom ---
  private resetZoom(): void {
    this.zoom.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  /** Toggle between fit and zoomed on double-click / double-tap. */
  protected toggleZoom(): void {
    if (this.isZoomed()) {
      this.resetZoom();
    } else {
      this.zoom.set(2.5);
    }
  }

  protected zoomIn(): void {
    this.zoom.update((z) => Math.min(MAX_ZOOM, +(z + 0.5).toFixed(2)));
  }

  protected zoomOut(): void {
    this.zoom.update((z) => {
      const next = Math.max(MIN_ZOOM, +(z - 0.5).toFixed(2));
      if (next === MIN_ZOOM) {
        this.panX.set(0);
        this.panY.set(0);
      }
      return next;
    });
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.deltaY < 0) this.zoomIn();
    else this.zoomOut();
  }

  // --- Pointer gestures: pan when zoomed, swipe-to-navigate otherwise ---
  protected onPointerDown(event: PointerEvent): void {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    if (this.isZoomed()) {
      // Drag to pan.
      this.dragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.panStartX = this.panX();
      this.panStartY = this.panY();
    } else if (this.images().length > 1) {
      // Swipe to change photo.
      this.swipeActive = true;
      this.swipeStartX = event.clientX;
      this.swipeStartY = event.clientY;
      this.swiping.set(true);
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.dragging) {
      this.panX.set(this.panStartX + (event.clientX - this.dragStartX));
      this.panY.set(this.panStartY + (event.clientY - this.dragStartY));
      return;
    }
    if (this.swipeActive) {
      const dx = event.clientX - this.swipeStartX;
      const dy = event.clientY - this.swipeStartY;
      // Once the gesture is clearly vertical, abandon the swipe (let it scroll/dismiss).
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
        this.cancelSwipe();
        return;
      }
      this.swipeX.set(dx);
    }
  }

  protected onPointerUp(): void {
    if (this.dragging) {
      this.dragging = false;
      return;
    }
    if (this.swipeActive) {
      const dx = this.swipeX();
      this.swipeActive = false;
      this.swiping.set(false);
      this.swipeX.set(0);
      if (dx <= -ShareViewComponent.SWIPE_THRESHOLD) this.next();
      else if (dx >= ShareViewComponent.SWIPE_THRESHOLD) this.prev();
    }
  }

  private cancelSwipe(): void {
    this.swipeActive = false;
    this.swiping.set(false);
    this.swipeX.set(0);
  }

  // --- Keyboard ---
  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.openIndex() === null) return;
    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
      case '+':
      case '=':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
    }
  }
}

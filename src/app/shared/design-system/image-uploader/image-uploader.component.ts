import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DEFAULT_RESIZE, resizeImage, ResizeOptions } from '../../utils/image-resize.util';

/** A file the component has resized and is ready to hand to the parent. */
export interface PreparedImage {
  blob: Blob;
  /** Object URL for the thumbnail preview; the parent need not manage it. */
  previewUrl: string;
}

/**
 * Picks image(s) from the device (camera on mobile), resizes them client-side
 * (Plan §6, EXIF-aware) and previews thumbnails. It does NOT upload — it emits
 * PreparedImage(s) and the feature service performs the actual POST, so the
 * same component serves the activity image list and the single profile image.
 *
 *   [multiple]="true"  → activity images (list)
 *   [multiple]="false" → profile image (single)
 *
 * The parent controls busy state via [uploading] (shows progress, disables input).
 */
@Component({
  selector: 'ds-image-uploader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label
        class="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed
               border-neutral-300 px-4 py-6 text-center cursor-pointer
               hover:border-primary hover:bg-primary-soft"
        [class.opacity-50]="busy()"
        [class.pointer-events-none]="busy()"
      >
        <span class="font-medium text-neutral-700">{{ label() }}</span>
        <span class="text-neutral-500">{{ hint() }}</span>
        <input
          type="file"
          accept="image/*"
          [multiple]="multiple()"
          [disabled]="busy()"
          (change)="onSelect($event)"
          class="sr-only"
        />
      </label>

      @if (preparing()) {
        <p class="mt-2 text-neutral-500">Processing image…</p>
      }
      @if (uploading()) {
        <p class="mt-2 text-primary">Uploading…</p>
      }
      @if (error()) {
        <p class="mt-2 text-error">{{ error() }}</p>
      }
    </div>
  `,
})
export class ImageUploaderComponent {
  readonly label = input('Add photo');
  readonly hint = input('Tap to choose or take a photo');
  readonly multiple = input(false);
  /** Parent-driven upload-in-flight flag. */
  readonly uploading = input(false);
  readonly resizeOptions = input<ResizeOptions>(DEFAULT_RESIZE);

  /** Emits one PreparedImage per selected file, after resize. */
  readonly prepared = output<PreparedImage>();

  protected readonly preparing = signal(false);
  protected readonly error = signal<string | null>(null);

  protected busy(): boolean {
    return this.preparing() || this.uploading();
  }

  protected async onSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // allow re-selecting the same file

    if (files.length === 0) return;

    this.error.set(null);
    this.preparing.set(true);
    try {
      for (const file of files) {
        const blob = await resizeImage(file, this.resizeOptions());
        this.prepared.emit({ blob, previewUrl: URL.createObjectURL(blob) });
      }
    } catch {
      this.error.set('Could not process that image. Please try another.');
    } finally {
      this.preparing.set(false);
    }
  }
}

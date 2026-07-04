/**
 * Client-side image resize/compression before upload (Plan §6). Keeps the
 * backend free of an image pipeline.
 *
 * Auto-orients using EXIF via `createImageBitmap(..., { imageOrientation:
 * 'from-image' })` so portrait phone-camera photos don't come out sideways.
 */
export interface ResizeOptions {
  /** Longest edge in px; the image is scaled down to fit, never up. */
  maxDimension: number;
  /** JPEG quality, 0..1. */
  quality: number;
}

export const DEFAULT_RESIZE: ResizeOptions = { maxDimension: 1600, quality: 0.82 };

export async function resizeImage(file: File, options: ResizeOptions = DEFAULT_RESIZE): Promise<Blob> {
  // Decode with EXIF orientation applied.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  try {
    const { width, height } = bitmap;
    const scale = Math.min(1, options.maxDimension / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable.');
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', options.quality),
    );
    if (!blob) {
      throw new Error('Image encoding failed.');
    }
    return blob;
  } finally {
    bitmap.close();
  }
}

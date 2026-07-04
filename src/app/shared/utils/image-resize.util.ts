/**
 * Client-side image resize/compression before upload (Plan section 6).
 * Keeps the backend free of an image pipeline. Full implementation lands in
 * the ImageUploader design-system phase; signature is fixed here.
 */
export interface ResizeOptions {
  maxDimension: number; // longest edge in px
  quality: number; // 0..1 JPEG quality
}

export async function resizeImage(_file: File, _options: ResizeOptions): Promise<Blob> {
  throw new Error('resizeImage not implemented yet (ImageUploader phase).');
}

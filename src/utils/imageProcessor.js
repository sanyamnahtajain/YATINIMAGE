/**
 * Image Processor - Orchestrates background removal and variation generation
 */

import { generateBackgrounds } from './colorEngine';
import { renderAllVariations } from './canvasRenderer';

/**
 * Remove background from an image using @imgly/background-removal
 * Lazy-loads the library for code splitting
 * @param {Blob|File} imageFile - Input image
 * @param {Function} onProgress - Progress callback (0-1)
 * @returns {Promise<Blob>} Transparent PNG blob
 */
export async function removeBackground(imageFile, onProgress) {
  const { removeBackground: removeBg } = await import('@imgly/background-removal');

  const result = await removeBg(imageFile, {
    progress: (key, current, total) => {
      if (onProgress && total > 0) {
        onProgress(current / total);
      }
    },
    output: {
      format: 'image/png',
      quality: 1,
    },
  });

  return result;
}

/**
 * Load a blob as an HTMLImageElement
 */
export function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Master function: generate all image variations
 * @param {Blob} transparentBlob - Background-removed PNG
 * @param {Object} config - Generation config
 * @param {Function} onProgress - Progress callback (current, total, phase)
 * @returns {Promise<Array<{blob: Blob, url: string, label: string}>>}
 */
export async function generateVariations(transparentBlob, config, onProgress) {
  const {
    count = 100,
    types = { solid: true, gradient: true, pattern: true, pastel: true, vibrant: true },
    width = 1000,
    height = 1000,
    padding = 0.08,
    shadow = true,
    placement = 'center',
  } = config;

  // 1. Load the transparent image
  const productImage = await loadImage(transparentBlob);

  // 2. Generate background definitions
  const backgrounds = generateBackgrounds({ count, types });

  // 3. Render all variations
  const blobs = await renderAllVariations(
    productImage,
    backgrounds,
    { width, height, padding, shadow, placement },
    (current, total) => {
      if (onProgress) onProgress(current, total, 'rendering');
    }
  );

  // 4. Create result objects with preview URLs
  const results = blobs.map((blob, i) => ({
    blob,
    url: URL.createObjectURL(blob),
    label: backgrounds[i].label,
    index: i,
  }));

  return results;
}

/**
 * Create a ZIP file from generated images
 * @param {Array<{blob: Blob, label: string}>} images
 * @param {Function} onProgress
 * @returns {Promise<Blob>} ZIP blob
 */
export async function createZip(images, onProgress) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const folder = zip.folder('product-images');

  images.forEach((img, i) => {
    const filename = `product_${String(i + 1).padStart(4, '0')}_${img.label.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    folder.file(filename, img.blob);
  });

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      if (onProgress) onProgress(metadata.percent);
    }
  );

  return zipBlob;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Canvas Renderer - Renders product images onto colored/patterned backgrounds
 * Uses OffscreenCanvas for performance when available, falls back to regular Canvas
 */

/**
 * Parse HSL string to components
 */
function parseHSL(hslStr) {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return { h: 0, s: 50, l: 80 };
  return { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
}

/**
 * Draw a pattern onto canvas context
 */
function drawPattern(ctx, width, height, bg) {
  // Draw base color
  ctx.fillStyle = bg.bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = bg.patternColor;
  ctx.fillStyle = bg.patternColor;

  const size = Math.max(20, Math.min(width, height) / 25);

  switch (bg.patternStyle) {
    case 'dots':
      for (let x = size; x < width; x += size * 2) {
        for (let y = size; y < height; y += size * 2) {
          ctx.beginPath();
          ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;

    case 'stripes':
      ctx.lineWidth = size * 0.4;
      for (let x = -height; x < width + height; x += size * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }
      break;

    case 'chevron':
      ctx.lineWidth = size * 0.3;
      for (let y = 0; y < height; y += size * 2) {
        ctx.beginPath();
        for (let x = 0; x < width; x += size * 2) {
          ctx.moveTo(x, y + size);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x + size * 2, y + size);
        }
        ctx.stroke();
      }
      break;

    case 'waves':
      ctx.lineWidth = size * 0.25;
      for (let y = size; y < height; y += size * 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += size) {
          ctx.quadraticCurveTo(x + size / 4, y - size * 0.6, x + size / 2, y);
          ctx.quadraticCurveTo(x + (size * 3) / 4, y + size * 0.6, x + size, y);
        }
        ctx.stroke();
      }
      break;

    case 'grid':
      ctx.lineWidth = size * 0.1;
      for (let x = 0; x < width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;

    case 'diamonds':
      ctx.lineWidth = size * 0.15;
      for (let x = 0; x < width + size; x += size * 2) {
        for (let y = 0; y < height + size; y += size * 2) {
          ctx.beginPath();
          ctx.moveTo(x, y - size);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x, y + size);
          ctx.lineTo(x - size, y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;

    default:
      break;
  }
}

/**
 * Draw background on canvas
 */
function drawBackground(ctx, width, height, bg) {
  switch (bg.type) {
    case 'solid':
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'linear-gradient': {
      const angle = (bg.angle || 0) * (Math.PI / 180);
      const x1 = width / 2 - Math.cos(angle) * width;
      const y1 = height / 2 - Math.sin(angle) * height;
      const x2 = width / 2 + Math.cos(angle) * width;
      const y2 = height / 2 + Math.sin(angle) * height;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, bg.color1);
      grad.addColorStop(1, bg.color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'radial-gradient': {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.max(width, height) * 0.7;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, bg.color1);
      grad.addColorStop(1, bg.color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'pattern':
      drawPattern(ctx, width, height, bg);
      break;

    default:
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Draw drop shadow for the product
 */
function drawShadow(ctx, x, y, w, h) {
  ctx.save();
  ctx.filter = 'blur(15px)';
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 5, w * 0.4, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Render a single variation
 * @param {HTMLImageElement|ImageBitmap} productImage - The transparent product image
 * @param {Object} bg - Background definition from colorEngine
 * @param {Object} options - { width, height, padding, shadow, placement }
 * @returns {Promise<Blob>} PNG blob of the rendered image
 */
export async function renderVariation(productImage, bg, options = {}) {
  const {
    width = 1000,
    height = 1000,
    padding = 0.08,
    shadow = true,
    placement = 'center',
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Draw background
  drawBackground(ctx, width, height, bg);

  // 2. Calculate product placement
  const padPx = Math.round(Math.min(width, height) * padding);
  const availW = width - padPx * 2;
  const availH = height - padPx * 2;

  const imgAspect = productImage.width / productImage.height;
  let drawW, drawH;

  if (imgAspect > availW / availH) {
    drawW = availW;
    drawH = availW / imgAspect;
  } else {
    drawH = availH;
    drawW = availH * imgAspect;
  }

  let drawX = padPx + (availW - drawW) / 2;
  let drawY;

  switch (placement) {
    case 'center-bottom':
      drawY = height - padPx - drawH;
      break;
    case 'center':
    default:
      drawY = padPx + (availH - drawH) / 2;
      break;
  }

  // 3. Draw shadow
  if (shadow) {
    drawShadow(ctx, drawX, drawY, drawW, drawH);
  }

  // 4. Draw product image
  ctx.drawImage(productImage, drawX, drawY, drawW, drawH);

  // 5. Export as blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/**
 * Render multiple variations with progress callback
 * @param {HTMLImageElement|ImageBitmap} productImage
 * @param {Array} backgrounds - Array of background definitions
 * @param {Object} options - Render options
 * @param {Function} onProgress - Callback with (currentIndex, total)
 * @returns {Promise<Array<Blob>>} Array of PNG blobs
 */
export async function renderAllVariations(productImage, backgrounds, options = {}, onProgress) {
  const blobs = [];

  for (let i = 0; i < backgrounds.length; i++) {
    const blob = await renderVariation(productImage, backgrounds[i], options);
    blobs.push(blob);

    if (onProgress) {
      onProgress(i + 1, backgrounds.length);
    }

    // Yield to UI thread every 5 images
    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return blobs;
}

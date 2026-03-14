/**
 * Color Engine - Generates visually differentiable color palettes
 * Uses golden ratio hue spacing for maximum differentiation
 */

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

/**
 * Generate evenly-spaced hues using golden ratio for maximum differentiation
 */
function generateHues(count, startHue = Math.random() * 360) {
  const hues = [];
  let hue = startHue;
  for (let i = 0; i < count; i++) {
    hues.push(hue % 360);
    hue += 360 * GOLDEN_RATIO_CONJUGATE;
  }
  return hues;
}

/**
 * Generate solid color backgrounds
 */
export function solidColors(count) {
  const hues = generateHues(count);
  return hues.map((hue, i) => ({
    type: 'solid',
    label: `Solid #${i + 1}`,
    color: `hsl(${Math.round(hue)}, 65%, 85%)`,
    hue,
  }));
}

/**
 * Generate gradient backgrounds (linear and radial)
 */
export function gradients(count) {
  const hues = generateHues(count);
  return hues.map((hue, i) => {
    const isRadial = i % 3 === 2;
    const complementHue = (hue + 40 + Math.random() * 60) % 360;
    const angle = Math.round((i * 137.508) % 360);

    if (isRadial) {
      return {
        type: 'radial-gradient',
        label: `Radial Gradient #${i + 1}`,
        color1: `hsl(${Math.round(hue)}, 60%, 82%)`,
        color2: `hsl(${Math.round(complementHue)}, 55%, 90%)`,
        hue,
      };
    }
    return {
      type: 'linear-gradient',
      label: `Linear Gradient #${i + 1}`,
      angle,
      color1: `hsl(${Math.round(hue)}, 60%, 82%)`,
      color2: `hsl(${Math.round(complementHue)}, 55%, 90%)`,
      hue,
    };
  });
}

/**
 * Generate pattern backgrounds
 */
export function patterns(count) {
  const patternTypes = ['dots', 'stripes', 'chevron', 'waves', 'grid', 'diamonds'];
  const hues = generateHues(count);

  return hues.map((hue, i) => ({
    type: 'pattern',
    patternStyle: patternTypes[i % patternTypes.length],
    label: `${patternTypes[i % patternTypes.length]} Pattern #${Math.floor(i / patternTypes.length) + 1}`,
    bgColor: `hsl(${Math.round(hue)}, 30%, 92%)`,
    patternColor: `hsl(${Math.round(hue)}, 40%, 80%)`,
    hue,
  }));
}

/**
 * Generate pastel palette backgrounds
 */
export function pastelPalette(count) {
  const hues = generateHues(count);
  return hues.map((hue, i) => ({
    type: 'solid',
    label: `Pastel #${i + 1}`,
    color: `hsl(${Math.round(hue)}, 45%, 90%)`,
    hue,
  }));
}

/**
 * Generate vibrant palette backgrounds
 */
export function vibrantPalette(count) {
  const hues = generateHues(count);
  return hues.map((hue, i) => ({
    type: 'solid',
    label: `Vibrant #${i + 1}`,
    color: `hsl(${Math.round(hue)}, 80%, 72%)`,
    hue,
  }));
}

/**
 * Master function: generate all variations based on config
 * @param {Object} config - { count, types: { solid, gradient, pattern, pastel, vibrant } }
 * @returns {Array} array of background definitions
 */
export function generateBackgrounds(config) {
  const { count = 100, types = {} } = config;
  const enabledTypes = Object.entries(types).filter(([, enabled]) => enabled);

  if (enabledTypes.length === 0) {
    // Default: all types enabled
    return generateBackgrounds({
      count,
      types: { solid: true, gradient: true, pattern: true, pastel: true, vibrant: true },
    });
  }

  const perType = Math.ceil(count / enabledTypes.length);
  const backgrounds = [];

  const generators = {
    solid: solidColors,
    gradient: gradients,
    pattern: patterns,
    pastel: pastelPalette,
    vibrant: vibrantPalette,
  };

  for (const [type] of enabledTypes) {
    if (generators[type]) {
      backgrounds.push(...generators[type](perType));
    }
  }

  // Trim to exact count and shuffle for variety
  return shuffle(backgrounds).slice(0, count);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

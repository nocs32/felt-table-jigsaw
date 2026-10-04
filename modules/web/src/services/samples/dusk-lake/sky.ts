import { disc, fullCircle, gradient, horizon, sunX, sunY, width, type Paint } from './canvas';

// The sky half: gradient and stars, the setting sun, thin clouds and three mountain ridges.

export const paintSky = (paint: Paint, random: () => number): void => {
  const stops: [number, string][] = [[0, '#0e1340'], [0.3, '#2b2a72'], [0.55, '#783a86'], [0.75, '#d55a6e'], [0.9, '#f29a5a'], [1, '#ffd27a']];

  paint.fillStyle = gradient(paint, 0, horizon, stops);
  paint.fillRect(0, 0, width, horizon);

  for (let k = 0; k < 340; k++) {
    const x = random() * width;
    const y = random() ** 1.8 * horizon * 0.55;
    const radius = random() * 1.5 + 0.3;

    paint.globalAlpha = 0.3 + random() * 0.7;
    disc(paint, x, y, radius, random() < 0.18 ? '#ffe2b0' : '#ffffff');
  }

  paint.globalAlpha = 1;
};

export const paintSun = (paint: Paint): void => {
  const glow = paint.createRadialGradient(sunX, sunY, 10, sunX, sunY, 440);

  glow.addColorStop(0, 'rgba(255,224,160,.85)');
  glow.addColorStop(0.25, 'rgba(255,170,110,.35)');
  glow.addColorStop(1, 'rgba(255,140,90,0)');
  paint.fillStyle = glow;
  paint.fillRect(0, 0, width, horizon);
  disc(paint, sunX, sunY, 80, '#ffe9b0');
  paint.save();
  paint.beginPath();
  paint.arc(sunX, sunY, 80, 0, fullCircle);
  paint.clip();
  paint.fillStyle = 'rgba(222,96,110,.92)';

  for (let k = 0; k < 6; k++) paint.fillRect(sunX - 90, sunY + 6 + k * 13, 180, 1.5 + k * 1.5);

  paint.restore();
};

export const paintClouds = (paint: Paint, random: () => number): void => {
  for (let k = 0; k < 11; k++) {
    const x = random() * width;
    const y = horizon * (0.3 + random() * 0.45);
    const w = 160 + random() * 420;
    const h = 8 + random() * 18;
    const green = 150 + Math.floor(random() * 70);
    const blue = 140 + Math.floor(random() * 50);

    paint.fillStyle = `rgba(255,${green},${blue},${(0.14 + random() * 0.24).toFixed(2)})`;
    paint.beginPath();
    paint.ellipse(x, y, w / 2, h / 2, 0, 0, fullCircle);
    paint.fill();
  }
};

interface Ridge {
  base: number;
  amp: number;
  rough: number;
  top: string;
  bottom: string;
  snow: boolean;
}

// Midpoint displacement: a rough skyline of 257 heights.
const ridgeHeights = (random: () => number, amp: number, rough: number): Float32Array => {
  const count = 256;
  const heights = new Float32Array(count + 1);

  heights[0] = (random() - 0.5) * amp;
  heights[count] = (random() - 0.5) * amp;

  for (let step = count; step > 1; step /= 2) {
    const half = step / 2;
    const scale = amp * (step / count) ** rough;

    for (let i = half; i < count; i += step) {
      heights[i] = ((heights[i - half] ?? 0) + (heights[i + half] ?? 0)) / 2 + (random() - 0.5) * scale;
    }
  }

  return heights;
};

const paintRidge = (paint: Paint, random: () => number, ridge: Ridge): void => {
  const heights = ridgeHeights(random, ridge.amp, ridge.rough);
  const path = new Path2D();

  path.moveTo(0, horizon + 4);
  heights.forEach((h, i) => path.lineTo((i / (heights.length - 1)) * width, ridge.base + h));
  path.lineTo(width, horizon + 4);
  path.closePath();
  paint.fillStyle = gradient(paint, ridge.base - ridge.amp, horizon, [[0, ridge.top], [1, ridge.bottom]]);
  paint.fill(path);

  if (ridge.snow) {
    paint.save();
    paint.clip(path);
    paint.fillStyle = gradient(paint, ridge.base - ridge.amp * 1.2, ridge.base - ridge.amp * 0.1, [[0, 'rgba(255,214,226,.75)'], [1, 'rgba(255,214,226,0)']]);
    paint.fillRect(0, ridge.base - ridge.amp * 2, width, ridge.amp * 2);
    paint.restore();
  }
};

export const paintMountains = (paint: Paint, random: () => number): void => {
  paintRidge(paint, random, { base: horizon - 160, amp: 130, rough: 0.85, top: '#9168b6', bottom: '#5b3d86', snow: true });
  paintRidge(paint, random, { base: horizon - 85, amp: 85, rough: 0.9, top: '#56407f', bottom: '#33275a', snow: false });
  paintRidge(paint, random, { base: horizon - 34, amp: 44, rough: 1, top: '#2b2352', bottom: '#1b1736', snow: false });
};

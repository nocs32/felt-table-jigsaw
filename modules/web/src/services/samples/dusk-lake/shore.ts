import { height, width, type Paint } from './canvas';

// The dark shores in front: two banks, pines along them and a cabin with lit windows.

const shoreColor = '#0a0b1a';
const pineColor = '#090a17';
const cabinColor = '#0d0d1f';
const cabinX = width * 0.19;

// Where the left bank's edge is at `x`.
const leftShoreAt = (x: number): number => height * 0.74 + Math.min(Math.max(x / (width * 0.46), 0), 1) ** 1.6 * height * 0.26;

const cabinBase = leftShoreAt(cabinX) + 6;

const paintBanks = (paint: Paint): void => {
  paint.fillStyle = shoreColor;
  paint.beginPath();
  paint.moveTo(0, height * 0.74);
  paint.bezierCurveTo(width * 0.12, height * 0.735, width * 0.28, height * 0.8, width * 0.46, height);
  paint.lineTo(0, height);
  paint.closePath();
  paint.fill();
  paint.beginPath();
  paint.moveTo(width, height * 0.8);
  paint.bezierCurveTo(width * 0.92, height * 0.8, width * 0.84, height * 0.9, width * 0.76, height);
  paint.lineTo(width, height);
  paint.closePath();
  paint.fill();
};

const paintPine = (paint: Paint, x: number, base: number, size: number, color: string): void => {
  paint.fillStyle = color;
  paint.fillRect(x - size * 0.025, base - size * 0.15, size * 0.05, size * 0.18);

  for (let k = 0; k < 4; k++) {
    const y = base - size * 0.12 - k * size * 0.2;
    const half = (size * (0.36 - k * 0.075)) / 2;

    paint.beginPath();
    paint.moveTo(x - half, y);
    paint.lineTo(x + half, y);
    paint.lineTo(x, y - size * 0.36);
    paint.closePath();
    paint.fill();
  }
};

// Pines along both banks, leaving room around the cabin.
const paintPines = (paint: Paint, random: () => number): void => {
  for (let x = 8; x < width * 0.33; x += 16 + random() * 26) {
    if (Math.abs(x - cabinX) < 70) continue;

    paintPine(paint, x, leftShoreAt(x) + 8, 150 - (x / (width * 0.33)) * 70 + random() * 40, random() < 0.5 ? pineColor : '#0c0d1e');
  }

  for (let x = width * 0.86; x < width; x += 14 + random() * 22) {
    paintPine(paint, x, height * 0.82 + (x - width * 0.86) * -0.05 + 10, 110 + random() * 60, pineColor);
  }
};

const paintCabinGlow = (paint: Paint): void => {
  const glow = paint.createRadialGradient(cabinX + 10, cabinBase - 30, 2, cabinX + 10, cabinBase - 30, 120);

  glow.addColorStop(0, 'rgba(255,190,100,.45)');
  glow.addColorStop(1, 'rgba(255,170,90,0)');
  paint.fillStyle = glow;
  paint.fillRect(cabinX - 120, cabinBase - 150, 260, 200);
};

const paintCabin = (paint: Paint): void => {
  paint.fillStyle = cabinColor;
  paint.fillRect(cabinX - 44, cabinBase - 52, 96, 56);
  paint.beginPath();
  paint.moveTo(cabinX - 54, cabinBase - 50);
  paint.lineTo(cabinX + 4, cabinBase - 92);
  paint.lineTo(cabinX + 62, cabinBase - 50);
  paint.closePath();
  paint.fill();
  paint.fillStyle = '#ffc865';
  paint.fillRect(cabinX - 26, cabinBase - 38, 18, 15);
  paint.fillRect(cabinX + 14, cabinBase - 38, 18, 15);
  paint.fillStyle = cabinColor;
  paint.fillRect(cabinX - 18, cabinBase - 38, 2, 15);
  paint.fillRect(cabinX + 22, cabinBase - 38, 2, 15);
};

export const paintShore = (paint: Paint, random: () => number): void => {
  paintBanks(paint);
  paintCabinGlow(paint);
  paintPines(paint, random);
  paintCabin(paint);
};

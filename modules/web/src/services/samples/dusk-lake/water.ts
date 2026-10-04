import { disc, gradient, height, horizon, sunX, width, type Paint } from './canvas';

// The lake: the sky mirrored, darkened with depth, a glittering path under the sun and ripples.
export const paintLake = (paint: Paint, random: () => number): void => {
  const sky = paint.getImageData(0, 0, width, horizon);
  const mirror = new OffscreenCanvas(width, horizon);

  mirror.getContext('2d')?.putImageData(sky, 0, 0);
  paint.fillStyle = '#191c48';
  paint.fillRect(0, horizon, width, height - horizon);
  paint.save();
  paint.translate(0, horizon * 2);
  paint.scale(1, -1);
  paint.globalAlpha = 0.6;
  paint.drawImage(mirror, 0, 0);
  paint.restore();
  paint.fillStyle = gradient(paint, horizon, height, [[0, 'rgba(18,20,60,.12)'], [1, 'rgba(6,8,28,.8)']]);
  paint.fillRect(0, horizon, width, height - horizon);

  for (let y = horizon + 2; y < height; y += 5) {
    const depth = (y - horizon) / (height - horizon);
    const w = 40 + depth * 260 * (0.4 + random() * 0.6);

    paint.fillStyle = `rgba(255,214,150,${(0.42 * (1 - depth) * (0.4 + random() * 0.6)).toFixed(3)})`;
    paint.fillRect(sunX - w / 2 + (random() - 0.5) * 30, y, w, 1.6 + depth * 1.5);
  }
};

export const paintRipples = (paint: Paint, random: () => number): void => {
  for (let k = 0; k < 260; k++) {
    const depth = random() ** 1.4;
    const y = horizon + depth * (height - horizon);
    const length = 18 + random() * 140 * (0.4 + depth);
    const x = random() * width;

    paint.strokeStyle = `rgba(210,190,255,${(0.04 + random() * 0.12).toFixed(3)})`;
    paint.lineWidth = 1 + depth;
    paint.beginPath();
    paint.moveTo(x, y);
    paint.lineTo(x + length, y);
    paint.stroke();
  }
};

export const paintBoat = (paint: Paint): void => {
  const x = width * 0.5;
  const y = height * 0.8;
  const lantern = paint.createRadialGradient(x + 20, y - 18, 1, x + 20, y - 18, 40);

  paint.fillStyle = 'rgba(255,200,120,.28)';
  paint.fillRect(x + 18, y + 6, 3, 90);
  paint.fillStyle = '#0b0b1c';
  paint.beginPath();
  paint.moveTo(x - 46, y - 6);
  paint.lineTo(x + 46, y - 6);
  paint.lineTo(x + 32, y + 6);
  paint.lineTo(x - 32, y + 6);
  paint.closePath();
  paint.fill();
  paint.fillRect(x - 2, y - 48, 3, 42);
  lantern.addColorStop(0, 'rgba(255,214,140,.9)');
  lantern.addColorStop(1, 'rgba(255,190,110,0)');
  paint.fillStyle = lantern;
  paint.fillRect(x - 30, y - 70, 100, 100);
  disc(paint, x + 20, y - 18, 4, '#ffe1a0');
};

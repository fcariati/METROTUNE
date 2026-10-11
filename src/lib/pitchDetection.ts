/**
 * Autocorrelation-based pitch detection.
 * Returns the detected fundamental frequency in Hz, or null if no clear pitch.
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;

  // RMS check — reject silence / very quiet signals
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null;

  // Trim silence from the ends
  let r1 = 0;
  let r2 = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) r1 = i;
    else break;
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < threshold) r2 = SIZE - i;
    else break;
  }

  const trimmed = buffer.slice(r1, r2);
  const trimmedSize = trimmed.length;
  if (trimmedSize < 2) return null;

  // Autocorrelation
  const c = new Float32Array(trimmedSize);
  for (let lag = 0; lag < trimmedSize; lag++) {
    c[lag] = 0;
    for (let i = 0; i < trimmedSize - lag; i++) {
      c[lag] += trimmed[i] * trimmed[i + lag];
    }
  }

  // Find the first valley then the next peak
  let d = 0;
  while (d < trimmedSize - 1 && c[d] > c[d + 1]) d++;

  let maxValue = 0;
  let maxIndex = 0;
  for (let i = d; i < trimmedSize; i++) {
    if (c[i] > maxValue) {
      maxValue = c[i];
      maxIndex = i;
    }
  }

  if (maxValue <= 0) return null;

  // Parabolic interpolation around the peak for sub-sample accuracy
  let T0 = maxIndex;
  const x1 = c[maxIndex - 1] ?? 0;
  const x2 = c[maxIndex];
  const x3 = c[maxIndex + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = maxIndex - b / (2 * a);

  const freq = sampleRate / T0;
  if (freq < 50 || freq > 2000) return null;
  return freq;
}

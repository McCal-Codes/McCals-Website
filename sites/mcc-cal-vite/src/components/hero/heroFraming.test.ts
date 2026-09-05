import { describe, expect, it } from 'vitest';
import { computeFrame } from './heroFraming';

const CENTRE = { x: 0.5, y: 0.5 };

/** Maps a UV through the returned frame the same way the shader does. */
function sample(frame: [number, number, number, number], u: number, v: number) {
  const [scaleX, scaleY, offsetU, offsetV] = frame;
  return { u: u * scaleX + offsetU, v: v * scaleY + offsetV };
}

describe('computeFrame', () => {
  it('samples the whole texture when the aspects match', () => {
    expect(computeFrame(1600, 900, 800, 450, CENTRE)).toEqual([1, 1, 0, 0]);
  });

  it('crops top and bottom when the canvas is wider than the image', () => {
    const [scaleX, scaleY] = computeFrame(1000, 1000, 2000, 1000, CENTRE);

    expect(scaleX).toBe(1);
    expect(scaleY).toBeCloseTo(0.5);
  });

  it('crops the sides when the canvas is narrower than the image', () => {
    const [scaleX, scaleY] = computeFrame(2000, 1000, 1000, 1000, CENTRE);

    expect(scaleX).toBeCloseTo(0.5);
    expect(scaleY).toBe(1);
  });

  it('keeps a centred crop centred', () => {
    const frame = computeFrame(2000, 1000, 1000, 1000, CENTRE);

    // Half the width is visible, so it should run from 0.25 to 0.75.
    expect(sample(frame, 0, 0).u).toBeCloseTo(0.25);
    expect(sample(frame, 1, 0).u).toBeCloseTo(0.75);
  });

  it('pans the crop toward a horizontal focal point', () => {
    const left = computeFrame(2000, 1000, 1000, 1000, { x: 0, y: 0.5 });
    const right = computeFrame(2000, 1000, 1000, 1000, { x: 1, y: 0.5 });

    expect(sample(left, 0, 0).u).toBeCloseTo(0);
    expect(sample(right, 1, 0).u).toBeCloseTo(1);
  });

  it('treats focal.y as measured from the top, flipping it for texture space', () => {
    // Half the height is visible. focal.y = 0 means "frame the top of the
    // photograph", and with flipY the top of the image is v = 1.
    const top = computeFrame(1000, 1000, 2000, 1000, { x: 0.5, y: 0 });
    const bottom = computeFrame(1000, 1000, 2000, 1000, { x: 0.5, y: 1 });

    expect(sample(top, 0, 1).v).toBeCloseTo(1);
    expect(sample(bottom, 0, 0).v).toBeCloseTo(0);
  });

  it('never samples outside the texture', () => {
    for (const focal of [{ x: 0, y: 0 }, { x: 1, y: 1 }, CENTRE]) {
      const frame = computeFrame(3000, 1000, 400, 900, focal);

      expect(sample(frame, 0, 0).u).toBeGreaterThanOrEqual(-1e-9);
      expect(sample(frame, 1, 1).u).toBeLessThanOrEqual(1 + 1e-9);
      expect(sample(frame, 0, 0).v).toBeGreaterThanOrEqual(-1e-9);
      expect(sample(frame, 1, 1).v).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it('falls back to the identity frame before the canvas has been laid out', () => {
    expect(computeFrame(1600, 900, 0, 0, CENTRE)).toEqual([1, 1, 0, 0]);
    expect(computeFrame(0, 0, 800, 600, CENTRE)).toEqual([1, 1, 0, 0]);
  });
});

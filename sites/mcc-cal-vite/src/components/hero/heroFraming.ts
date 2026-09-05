export interface HeroFocalPoint {
  /** 0 = left edge, 1 = right edge. */
  x: number;
  /** 0 = top edge, 1 = bottom edge, matching CSS object-position. */
  y: number;
}

/**
 * Reproduces CSS `object-fit: cover` with `object-position` as a UV transform,
 * so the WebGL layer frames a photograph exactly the way the <img> beneath it
 * does. Returns [scaleX, scaleY, offsetU, offsetV].
 *
 * The V offset is flipped because three uploads textures with flipY, so v = 1
 * is the top of the photograph while focal.y is measured from the top down.
 */
export function computeFrame(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  focal: HeroFocalPoint,
): [number, number, number, number] {
  if (!imageWidth || !imageHeight || !canvasWidth || !canvasHeight) {
    return [1, 1, 0, 0];
  }

  const imageAspect = imageWidth / imageHeight;
  const canvasAspect = canvasWidth / canvasHeight;

  // A canvas wider than the image fills the width and crops top and bottom;
  // a narrower one fills the height and crops the sides.
  const scaleX = canvasAspect > imageAspect ? 1 : canvasAspect / imageAspect;
  const scaleY = canvasAspect > imageAspect ? imageAspect / canvasAspect : 1;

  return [scaleX, scaleY, (1 - scaleX) * focal.x, (1 - scaleY) * (1 - focal.y)];
}

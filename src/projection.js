import { FOV } from "./config.js";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

export const projectObject = (
  object,
  player,
  camera,
  columns,
  rows,
) => {
  const dx = object.x - player.x;
  const dy = object.y - player.y;

  const distance = Math.hypot(dx, dy);

  if (distance <= 0.05) return null;

  const angle = Math.atan2(dy, dx);

  const relativeAngle = normalizeAngle(
    angle - camera.yaw,
  );

  if (
    Math.abs(relativeAngle) >
    FOV / 2 + 0.15
  ) {
    return null;
  }

  const correctedDistance =
    distance *
    Math.cos(relativeAngle);

  if (correctedDistance <= 0.05) {
    return null;
  }

  const horizontalProjection =
    columns /
    (2 * Math.tan(FOV / 2));

  const verticalProjection =
    rows /
    (2 * Math.tan(FOV / 2));

  const horizon =
    rows / 2 +
    Math.tan(camera.pitch) *
    verticalProjection;

  const centerX =
    columns / 2 +
    Math.tan(relativeAngle) *
    horizontalProjection;

  const screenWidth =
    (object.width /
      correctedDistance) *
    horizontalProjection;

  const screenHeight =
    (object.height /
      correctedDistance) *
    verticalProjection;

  const bottom =
    horizon -
    ((object.z - player.z) /
      correctedDistance) *
    verticalProjection;

  const top = bottom - screenHeight;

  return {
    distance,
    correctedDistance,
    centerX,
    top,
    bottom,
    screenWidth,
    screenHeight,
  };
};

export const projectShapePoint = (
  projection,
  x,
  y,
) => ({
  x:
    projection.centerX +
    x * projection.screenWidth,

  y:
    projection.bottom -
    y * projection.screenHeight,
});
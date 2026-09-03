import { MAX_DEPTH } from "./config.js";

export const castRay = (world, x, y, angle) => {
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  let mapX = Math.floor(x);
  let mapY = Math.floor(y);

  const deltaX =
    dirX === 0
      ? Infinity
      : Math.abs(1 / dirX);

  const deltaY =
    dirY === 0
      ? Infinity
      : Math.abs(1 / dirY);

  const stepX = dirX < 0 ? -1 : 1;
  const stepY = dirY < 0 ? -1 : 1;

  let sideX =
    (dirX < 0
      ? x - mapX
      : mapX + 1 - x) *
    deltaX;

  let sideY =
    (dirY < 0
      ? y - mapY
      : mapY + 1 - y) *
    deltaY;

  let side = 0;

  while (true) {
    if (sideX < sideY) {
      mapX += stepX;
      sideX += deltaX;
      side = 0;
    } else {
      mapY += stepY;
      sideY += deltaY;
      side = 1;
    }

    const distance =
      side === 0
        ? sideX - deltaX
        : sideY - deltaY;

    if (distance > MAX_DEPTH) {
      return null;
    }

    const height =
      world.heightAt(mapX, mapY);

    if (height <= 0) {
      continue;
    }

    return {
      x: mapX,
      y: mapY,
      distance,
      height,
      side,
      tile: world.tileAt(mapX, mapY),
      landmark: world.landmarkAt(
        mapX,
        mapY,
      ),
    };
  }
};
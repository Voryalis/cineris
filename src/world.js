import {
  BLOCK_HEIGHT,
  BLOCK_WIDTH,
  ROAD_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "./config.js";

const isRoadAxis = (value, blockSize) => value % blockSize < ROAD_WIDTH;

const facadeGlyph = (x, y) => {
  const edgeX = x % BLOCK_WIDTH;
  const edgeY = y % BLOCK_HEIGHT;
  const nearRoad = edgeX === ROAD_WIDTH || edgeY === ROAD_WIDTH;
  if (nearRoad) return "#";
  return (x * 17 + y * 31) % 11 === 0 ? "+" : "#";
};

export class World {
  width = WORLD_WIDTH;
  height = WORLD_HEIGHT;

  contains(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  isWalkable(x, y) {
    if (!this.contains(x, y)) return false;
    return isRoadAxis(x, BLOCK_WIDTH) || isRoadAxis(y, BLOCK_HEIGHT);
  }

  glyphAt(x, y) {
    if (!this.contains(x, y)) return " ";

    const vertical = isRoadAxis(x, BLOCK_WIDTH);
    const horizontal = isRoadAxis(y, BLOCK_HEIGHT);

    if (vertical && horizontal) return ".";
    if (vertical) return x % BLOCK_WIDTH === 1 ? "|" : ":";
    if (horizontal) return y % BLOCK_HEIGHT === 1 ? "-" : ":";

    return facadeGlyph(x, y);
  }
}

import {
  BLOCK_SIZE,
  ROAD_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "./config.js";

const buildingHeight = (blockX, blockY) => {
  const value = Math.abs(
    (blockX * 73856093) ^
    (blockY * 19349663),
  );

  return 1.8 + (value % 5) * 0.65;
};

export class World {
  width = WORLD_WIDTH;
  height = WORLD_HEIGHT;

  #heights;

  constructor() {
    this.#heights = Array.from(
      { length: this.height },
      (_, y) =>
        Array.from(
          { length: this.width },
          (_, x) => this.#generateHeight(x, y),
        ),
    );
  }

  #generateHeight(x, y) {
    if (
      x === 0 ||
      y === 0 ||
      x === this.width - 1 ||
      y === this.height - 1
    ) {
      return 4;
    }

    const localX = x % BLOCK_SIZE;
    const localY = y % BLOCK_SIZE;

    const building =
      localX > ROAD_WIDTH &&
      localY > ROAD_WIDTH &&
      localX < BLOCK_SIZE - 1 &&
      localY < BLOCK_SIZE - 1;

    if (!building) return 0;

    return buildingHeight(
      Math.floor(x / BLOCK_SIZE),
      Math.floor(y / BLOCK_SIZE),
    );
  }

  heightAt(x, y) {
    if (
      x < 0 ||
      y < 0 ||
      x >= this.width ||
      y >= this.height
    ) {
      return Infinity;
    }

    return this.#heights[y][x];
  }

  canOccupy(x, y, radius) {
    const points = [
      [x - radius, y - radius],
      [x + radius, y - radius],
      [x - radius, y + radius],
      [x + radius, y + radius],
    ];

    return points.every(
      ([px, py]) =>
        this.heightAt(
          Math.floor(px),
          Math.floor(py),
        ) === 0,
    );
  }
}
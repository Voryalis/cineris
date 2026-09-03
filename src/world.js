export const TILE = Object.freeze({
  VOID: 0,
  ROAD: 1,
  PAVEMENT: 2,
  FLOOR: 3,
  WALL: 4,
  DOOR: 5,
  SHELF: 6,
  TREE: 7,
  LOW_WALL: 8,
});

export const MAP_WIDTH = 72;
export const MAP_HEIGHT = 64;
import {
  DISTRICT_MAP,
  MAP_HEIGHT,
  MAP_WIDTH,
  TILE,
} from "./map.js";

import {
  OBJECT_TYPE,
  WORLD_OBJECTS,
} from "./objects.js";

import {
  LANDMARK_LABELS,
} from "./labels.js";

const WALKABLE_TILES = new Set([
  TILE.ROAD,
  TILE.PAVEMENT,
  TILE.FLOOR,
  TILE.DOOR,
]);

const HEIGHT_BY_TILE = Object.freeze({
  [TILE.VOID]: 0,
  [TILE.ROAD]: 0,
  [TILE.PAVEMENT]: 0,
  [TILE.FLOOR]: 0,
  [TILE.DOOR]: 0,
  [TILE.WALL]: 3.4,
  [TILE.SHELF]: 2.2,
  [TILE.TREE]: 3.8,
  [TILE.LOW_WALL]: 0.75,
});

export class World {
  width = MAP_WIDTH;
  height = MAP_HEIGHT;
  objects = WORLD_OBJECTS;

  tileAt(x, y) {
    if (
      x < 0 ||
      y < 0 ||
      x >= this.width ||
      y >= this.height
    ) {
      return TILE.WALL;
    }

    return DISTRICT_MAP[y][x];
  }

  heightAt(x, y) {
    return HEIGHT_BY_TILE[
      this.tileAt(x, y)
    ] ?? 0;
  }

  isWalkable(x, y) {
    return WALKABLE_TILES.has(
      this.tileAt(x, y),
    );
  }

  #objectCollision(x, y, radius) {
    for (const object of this.objects) {
      if (
        object.type !== OBJECT_TYPE.GRAVE
      ) {
        continue;
      }

      const dx = x - object.x;
      const dy = y - object.y;

      const objectRadius =
        object.width * 0.32;

      if (
        Math.hypot(dx, dy) <
        radius + objectRadius
      ) {
        return true;
      }
    }

    return false;
  }

  canOccupy(x, y, radius) {
    const points = [
      [x - radius, y - radius],
      [x + radius, y - radius],
      [x - radius, y + radius],
      [x + radius, y + radius],
    ];

    const terrainClear =
      points.every(
        ([px, py]) =>
          this.isWalkable(
            Math.floor(px),
            Math.floor(py),
          ),
      );

    if (!terrainClear) {
      return false;
    }

    return !this.#objectCollision(
      x,
      y,
      radius,
    );
  }

  landmarkAt(x, y) {
    if (
      x >= 25 &&
      x <= 48 &&
      y >= 15 &&
      y <= 37
    ) {
      return LANDMARK_LABELS.church;
    }

    if (
      x >= 17 &&
      x <= 55 &&
      y >= 2 &&
      y <= 15
    ) {
      return LANDMARK_LABELS.cemetery;
    }

    if (
      x >= 47 &&
      x <= 68 &&
      y >= 35 &&
      y <= 54
    ) {
      return LANDMARK_LABELS.library;
    }

    if (
      x >= 3 &&
      x <= 27 &&
      y >= 33 &&
      y <= 60
    ) {
      return LANDMARK_LABELS.oldDistrict;
    }

    return null;
  }
}
export const SPAWN = Object.freeze({
  x: 36.5,
  y: 47.5,
  yaw: -Math.PI / 2,
});

const grid = Array.from(
  { length: MAP_HEIGHT },
  () => Array(MAP_WIDTH).fill(TILE.VOID),
);

const set = (x, y, tile) => {
  if (
    x < 0 ||
    y < 0 ||
    x >= MAP_WIDTH ||
    y >= MAP_HEIGHT
  ) {
    return;
  }

  grid[y][x] = tile;
};

const fill = (x, y, width, height, tile) => {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      set(px, py, tile);
    }
  }
};

const outline = (x, y, width, height, tile) => {
  for (let px = x; px < x + width; px += 1) {
    set(px, y, tile);
    set(px, y + height - 1, tile);
  }

  for (let py = y; py < y + height; py += 1) {
    set(x, py, tile);
    set(x + width - 1, py, tile);
  }
};

fill(2, 43, 68, 5, TILE.ROAD);
fill(34, 12, 5, 49, TILE.ROAD);

fill(29, 38, 15, 15, TILE.PAVEMENT);

fill(25, 15, 23, 23, TILE.PAVEMENT);

fill(31, 18, 11, 18, TILE.WALL);
fill(32, 19, 9, 16, TILE.FLOOR);

fill(27, 23, 19, 8, TILE.WALL);
fill(28, 24, 17, 6, TILE.FLOOR);

fill(33, 15, 7, 5, TILE.WALL);
fill(34, 16, 5, 4, TILE.FLOOR);

fill(34, 33, 5, 5, TILE.WALL);
fill(35, 34, 3, 3, TILE.FLOOR);

set(36, 37, TILE.DOOR);

fill(32, 21, 9, 1, TILE.WALL);
set(36, 21, TILE.DOOR);

fill(17, 2, 39, 14, TILE.PAVEMENT);
outline(17, 2, 39, 14, TILE.LOW_WALL);

set(35, 15, TILE.PAVEMENT);
set(36, 15, TILE.PAVEMENT);
set(37, 15, TILE.PAVEMENT);

fill(35, 4, 3, 12, TILE.PAVEMENT);
fill(20, 8, 33, 2, TILE.PAVEMENT);

for (const [x, y] of [
  [20, 4],
  [26, 4],
  [32, 4],
  [42, 4],
  [48, 4],
  [53, 4],
  [20, 13],
  [26, 13],
  [42, 13],
  [48, 13],
  [53, 13],
]) {
  set(x, y, TILE.TREE);
}

fill(47, 35, 22, 20, TILE.PAVEMENT);

fill(49, 37, 19, 17, TILE.WALL);
fill(50, 38, 17, 15, TILE.FLOOR);

set(49, 44, TILE.DOOR);
set(49, 45, TILE.DOOR);

for (const y of [39, 42, 48, 51]) {
  for (let x = 53; x <= 64; x += 2) {
    set(x, y, TILE.SHELF);
  }
}

fill(3, 33, 24, 27, TILE.PAVEMENT);

fill(5, 35, 8, 8, TILE.WALL);
fill(6, 36, 6, 6, TILE.FLOOR);
set(9, 42, TILE.DOOR);

fill(16, 34, 10, 9, TILE.WALL);
fill(17, 35, 8, 7, TILE.FLOOR);
set(20, 42, TILE.DOOR);

fill(4, 47, 11, 10, TILE.WALL);
fill(5, 48, 9, 8, TILE.FLOOR);
set(10, 47, TILE.DOOR);

fill(17, 46, 9, 12, TILE.WALL);
fill(18, 47, 7, 10, TILE.FLOOR);
set(20, 46, TILE.DOOR);

fill(13, 33, 2, 27, TILE.ROAD);
fill(3, 43, 24, 3, TILE.ROAD);

export const DISTRICT_MAP = grid;
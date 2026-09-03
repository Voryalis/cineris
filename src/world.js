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

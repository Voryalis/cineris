import {
  DISTRICT_MAP,
  MAP_HEIGHT,
  MAP_WIDTH,
  TILE,
} from "./map.js";

import {
  GRAVE_LABELS,
  ICON_LABELS,
  LANDMARK_LABELS,
} from "./labels.js";

const SOLID_TILES = new Set([
  TILE.WALL,
  TILE.GRAVE,
  TILE.SHELF,
  TILE.ICON,
  TILE.TREE,
]);

const HEIGHT_BY_TILE = Object.freeze({
  [TILE.VOID]: 0,
  [TILE.ROAD]: 0,
  [TILE.PAVEMENT]: 0,
  [TILE.FLOOR]: 0,
  [TILE.DOOR]: 0,
  [TILE.WALL]: 3.4,
  [TILE.GRAVE]: 1.1,
  [TILE.SHELF]: 2.2,
  [TILE.ICON]: 1.8,
  [TILE.TREE]: 3,
});

const gravePositions = [
  [23, 5],
  [29, 5],
  [35, 5],
  [41, 5],
  [47, 5],
];

const iconPositions = [
  [30, 23],
  [32, 23],
  [34, 23],
  [36, 23],
  [38, 23],
  [40, 23],
  [42, 23],
];

const labelMap = new Map();

gravePositions.forEach(([x, y], index) => {
  labelMap.set(`${x},${y}`, GRAVE_LABELS[index]);
});

iconPositions.forEach(([x, y], index) => {
  labelMap.set(`${x},${y}`, ICON_LABELS[index]);
});

export class World {
  width = MAP_WIDTH;
  height = MAP_HEIGHT;

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
    const tile = this.tileAt(x, y);
    return HEIGHT_BY_TILE[tile] ?? 0;
  }

  isSolid(x, y) {
    return SOLID_TILES.has(
      this.tileAt(x, y),
    );
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
        !this.isSolid(
          Math.floor(px),
          Math.floor(py),
        ),
    );
  }

  labelAt(x, y) {
    return labelMap.get(`${x},${y}`) ?? null;
  }

  landmarkAt(x, y) {
    if (x >= 28 && x <= 44 && y >= 19 && y <= 34) {
      return LANDMARK_LABELS.church;
    }

    if (x >= 18 && x <= 54 && y >= 2 && y <= 15) {
      return LANDMARK_LABELS.cemetery;
    }

    if (x >= 50 && x <= 66 && y >= 37 && y <= 52) {
      return LANDMARK_LABELS.library;
    }

    if (x >= 3 && x <= 26 && y >= 33 && y <= 59) {
      return LANDMARK_LABELS.oldDistrict;
    }

    return null;
  }
}
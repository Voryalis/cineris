export const TILE = Object.freeze({
  VOID: 0,
  ROAD: 1,
  PAVEMENT: 2,
  FLOOR: 3,
  WALL: 4,
  DOOR: 5,
  GRAVE: 6,
  SHELF: 7,
  ICON: 8,
  TREE: 9,
});

export const MAP_WIDTH = 72;
export const MAP_HEIGHT = 64;

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
  if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) return;
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

fill(26, 17, 21, 20, TILE.PAVEMENT);
fill(28, 19, 17, 16, TILE.FLOOR);
outline(28, 19, 17, 16, TILE.WALL);

set(36, 34, TILE.DOOR);

fill(31, 21, 11, 1, TILE.WALL);
set(36, 21, TILE.DOOR);

set(30, 23, TILE.ICON);
set(32, 23, TILE.ICON);
set(34, 23, TILE.ICON);
set(36, 23, TILE.ICON);
set(38, 23, TILE.ICON);
set(40, 23, TILE.ICON);
set(42, 23, TILE.ICON);

fill(18, 2, 37, 14, TILE.PAVEMENT);
outline(18, 2, 37, 14, TILE.WALL);

set(36, 15, TILE.DOOR);

const graves = [
  [23, 5],
  [29, 5],
  [35, 5],
  [41, 5],
  [47, 5],
];

for (const [x, y] of graves) {
  set(x, y, TILE.GRAVE);
}

for (const x of [21, 27, 33, 39, 45, 51]) {
  set(x, 3, TILE.TREE);
  set(x, 13, TILE.TREE);
}

fill(48, 35, 21, 20, TILE.PAVEMENT);
fill(50, 37, 17, 16, TILE.FLOOR);
outline(50, 37, 17, 16, TILE.WALL);

set(50, 45, TILE.DOOR);

for (const y of [39, 42, 48, 51]) {
  for (let x = 53; x <= 64; x += 2) {
    set(x, y, TILE.SHELF);
  }
}

fill(3, 33, 24, 27, TILE.PAVEMENT);

const oldDistrictBuildings = [
  [5, 35, 8, 8],
  [15, 35, 10, 8],
  [5, 46, 10, 11],
  [17, 46, 8, 11],
];

for (const [x, y, width, height] of oldDistrictBuildings) {
  fill(x, y, width, height, TILE.FLOOR);
  outline(x, y, width, height, TILE.WALL);
}

set(9, 42, TILE.DOOR);
set(20, 42, TILE.DOOR);
set(10, 46, TILE.DOOR);
set(20, 46, TILE.DOOR);

fill(13, 33, 2, 27, TILE.ROAD);
fill(3, 43, 24, 3, TILE.ROAD);

export const DISTRICT_MAP = grid;
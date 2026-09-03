import { TILE } from "./map.js";

export const MATERIAL = Object.freeze({
  STONE: "stone",
  PLASTER: "plaster",
  BRICK: "brick",
  CHURCH: "church",
  LIBRARY: "library",
  METAL: "metal",
});

const churchHeight = (x, y) => {
  if (
    x >= 33 &&
    x <= 39 &&
    y >= 15 &&
    y <= 19
  ) {
    return 7.5;
  }

  if (
    x >= 31 &&
    x <= 41 &&
    y >= 18 &&
    y <= 35
  ) {
    return 5.2;
  }

  if (
    x >= 27 &&
    x <= 45 &&
    y >= 23 &&
    y <= 30
  ) {
    return 4.4;
  }

  if (
    x >= 34 &&
    x <= 38 &&
    y >= 33 &&
    y <= 37
  ) {
    return 3.8;
  }

  return null;
};

const libraryHeight = (x, y) => {
  if (
    x >= 49 &&
    x <= 67 &&
    y >= 37 &&
    y <= 53
  ) {
    return 4.8;
  }

  return null;
};

const oldDistrictHeight = (x, y) => {
  if (
    x >= 5 &&
    x <= 12 &&
    y >= 35 &&
    y <= 42
  ) {
    return 4.2;
  }

  if (
    x >= 16 &&
    x <= 25 &&
    y >= 34 &&
    y <= 42
  ) {
    return 5.4;
  }

  if (
    x >= 4 &&
    x <= 14 &&
    y >= 47 &&
    y <= 56
  ) {
    return 3.7;
  }

  if (
    x >= 17 &&
    x <= 25 &&
    y >= 46 &&
    y <= 57
  ) {
    return 4.8;
  }

  return null;
};

export const architectureAt = (
  x,
  y,
  tile,
) => {
  if (tile === TILE.LOW_WALL) {
    return {
      height: 0.75,
      material: MATERIAL.STONE,
    };
  }

  if (tile === TILE.TREE) {
    return {
      height: 4.2,
      material: MATERIAL.STONE,
    };
  }

  if (tile === TILE.SHELF) {
    return {
      height: 2.2,
      material: MATERIAL.BRICK,
    };
  }

  if (tile !== TILE.WALL) {
    return {
      height: 0,
      material: null,
    };
  }

  const church =
    churchHeight(x, y);

  if (church !== null) {
    return {
      height: church,
      material: MATERIAL.CHURCH,
    };
  }

  const library =
    libraryHeight(x, y);

  if (library !== null) {
    return {
      height: library,
      material: MATERIAL.LIBRARY,
    };
  }

  const oldDistrict =
    oldDistrictHeight(x, y);

  if (oldDistrict !== null) {
    return {
      height: oldDistrict,
      material:
        (x + y) % 2 === 0
          ? MATERIAL.PLASTER
          : MATERIAL.BRICK,
    };
  }

  return {
    height: 3.4,
    material: MATERIAL.STONE,
  };
};
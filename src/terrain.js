import {
  quad,
  vertex,
} from "./geometry.js";

import {
  MAP_HEIGHT,
  MAP_WIDTH,
} from "./main.js";

export const TERRAIN = Object.freeze({
  GROUND: "ground",
});

export const TERRAIN_MESH =
  Object.freeze([
    ...quad(
      vertex(0, 0, 0),
      vertex(MAP_WIDTH, 0, 0),
      vertex(
        MAP_WIDTH,
        MAP_HEIGHT,
        0,
      ),
      vertex(0, MAP_HEIGHT, 0),
      TERRAIN.GROUND,
    ),
  ]);
    
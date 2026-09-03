import {
  MAX_DEPTH,
} from "./config.js";

import {
  quad,
  vertex,
} from "./geometry.js";

import {
  MAP_HEIGHT,
  MAP_WIDTH,
} from "./map.js";

export const TERRAIN = Object.freeze({
  GROUND: "ground",
});

const MARGIN =
  MAX_DEPTH * 2;

export const TERRAIN_MESH =
  Object.freeze([
    ...quad(
      vertex(
        -MARGIN,
        -MARGIN,
        0,
      ),

      vertex(
        MAP_WIDTH + MARGIN,
        -MARGIN,
        0,
      ),

      vertex(
        MAP_WIDTH + MARGIN,
        MAP_HEIGHT + MARGIN,
        0,
      ),

      vertex(
        -MARGIN,
        MAP_HEIGHT + MARGIN,
        0,
      ),

      TERRAIN.GROUND,
    ),
  ]);
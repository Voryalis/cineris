import {
  FOV,
  MAX_DEPTH,
  UI_FONT_SIZE,
  UI_LINE_HEIGHT,
  WORLD_FONT_SIZE,
  WORLD_LINE_HEIGHT,
} from "./config.js";

import { MATERIAL } from "./architecture.js";
import { TILE } from "./map.js";
import { OBJECT_TYPE } from "./objects.js";
import { castRay } from "./raycast.js";

import {
  projectObject,
  projectShapePoint,
} from "./projection.js";

const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

const PALETTE = Object.freeze({
  background: "#07080a",

  fog: "#393d43",

  groundNear: "#555d62",
  groundMid: "#3d4449",
  groundFar: "#292e33",

  stoneNear: "#a09fa5",
  stoneMid: "#777981",
  stoneFar: "#50535a",

  plasterNear: "#9b99a1",
  plasterMid: "#72717b",

  brickNear: "#8a858e",
  brickMid: "#66616b",

  churchNear: "#9692a1",
  churchMid: "#6e6a7b",
  churchFar: "#4e4b59",

  libraryNear: "#8697a0",
  libraryMid: "#61727b",
  libraryFar: "#46545b",

  roof: "#706b7a",
  roofBlue: "#657780",

  lavender: "#898297",
  blue: "#788d98",

  grave: "#99979d",
  icon: "#9a91a8",

  text: "#cbd2d5",
  textBackground: "#090a0c",
});

const FLOOR_SHADES = [
  ".",
  ".",
  "·",
  ".",
];

const depthRatio = (distance) =>
  Math.min(
    1,
    distance / MAX_DEPTH,
  );

const distanceColor = (
  distance,
  near,
  mid,
  far,
) => {
  const depth =
    depthRatio(distance);

  if (depth < 0.28) {
    return near;
  }

  if (depth < 0.62) {
    return mid;
  }

  return far;
};

const materialColor = (
  material,
  distance,
) => {
  if (material === MATERIAL.CHURCH) {
    return distanceColor(
      distance,
      PALETTE.churchNear,
      PALETTE.churchMid,
      PALETTE.churchFar,
    );
  }

  if (material === MATERIAL.LIBRARY) {
    return distanceColor(
      distance,
      PALETTE.libraryNear,
      PALETTE.libraryMid,
      PALETTE.libraryFar,
    );
  }

  if (material === MATERIAL.PLASTER) {
    return distanceColor(
      distance,
      PALETTE.plasterNear,
      PALETTE.plasterMid,
      PALETTE.stoneFar,
    );
  }

  if (material === MATERIAL.BRICK) {
    return distanceColor(
      distance,
      PALETTE.brickNear,
      PALETTE.brickMid,
      PALETTE.stoneFar,
    );
  }

  return distanceColor(
    distance,
    PALETTE.stoneNear,
    PALETTE.stoneMid,
    PALETTE.stoneFar,
  );
};

const groundColor = (
  row,
  horizon,
  rows,
) => {
  const depth =
    (
      row -
      horizon
    ) /
    Math.max(
      1,
      rows - horizon,
    );

  if (depth > 0.62) {
    return PALETTE.groundNear;
  }

  if (depth > 0.22) {
    return PALETTE.groundMid;
  }

  return PALETTE.groundFar;
};

const churchRoofBonus = (
  x,
  y,
) => {
  if (
    x >= 34 &&
    x <= 39 &&
    y >= 15 &&
    y <= 19
  ) {
    const center = 36.5;

    return Math.max(
      0,
      2.8 -
      Math.abs(
        x + 0.5 - center,
      ) * 0.9,
    );
  }

  if (
    x >= 31 &&
    x <= 41 &&
    y >= 18 &&
    y <= 35
  ) {
    const center = 36;

    return Math.max(
      0.2,
      1.35 -
      Math.abs(
        x + 0.5 - center,
      ) * 0.22,
    );
  }

  if (
    x >= 27 &&
    x <= 45 &&
    y >= 23 &&
    y <= 30
  ) {
    const center = 26.5;

    return Math.max(
      0.15,
      1.0 -
      Math.abs(
        y + 0.5 - center,
      ) * 0.25,
    );
  }

  if (
    x >= 34 &&
    x <= 38 &&
    y >= 33 &&
    y <= 37
  ) {
    return 0.9;
  }

  return 0;
};

const oldDistrictRoofBonus = (
  x,
  y,
) => {
  const buildings = [
    {
      x1: 5,
      x2: 12,
      y1: 35,
      y2: 42,
    },
    {
      x1: 16,
      x2: 25,
      y1: 34,
      y2: 42,
    },
    {
      x1: 4,
      x2: 14,
      y1: 47,
      y2: 56,
    },
    {
      x1: 17,
      x2: 25,
      y1: 46,
      y2: 57,
    },
  ];

  for (const building of buildings) {
    if (
      x < building.x1 ||
      x > building.x2 ||
      y < building.y1 ||
      y > building.y2
    ) {
      continue;
    }

    const center =
      (
        building.x1 +
        building.x2
      ) / 2;

    const half =
      Math.max(
        1,
        (
          building.x2 -
          building.x1
        ) / 2,
      );

    return Math.max(
      0.15,
      1.25 *
      (
        1 -
        Math.abs(
          x - center,
        ) /
        half
      ),
    );
  }

  return 0;
};

const roofBonus = (hit) => {
  if (
    hit.material ===
    MATERIAL.CHURCH
  ) {
    return churchRoofBonus(
      hit.x,
      hit.y,
    );
  }

  if (
    hit.material ===
    MATERIAL.LIBRARY
  ) {
    return 0.55;
  }

  if (
    hit.material ===
    MATERIAL.PLASTER ||
    hit.material ===
    MATERIAL.BRICK
  ) {
    return oldDistrictRoofBonus(
      hit.x,
      hit.y,
    );
  }

  return 0;
};

const roofGlyph = (
  hit,
  row,
  roofTop,
  wallTop,
) => {
  const height =
    Math.max(
      1,
      wallTop - roofTop,
    );

  const t =
    (
      row -
      roofTop
    ) /
    height;

  if (
    hit.material ===
    MATERIAL.CHURCH
  ) {
    if (
      hit.x >= 34 &&
      hit.x <= 39 &&
      hit.y >= 15 &&
      hit.y <= 19
    ) {
      if (t < 0.12) {
        return "†";
      }

      if (t < 0.42) {
        return "│";
      }

      return t < 0.72
        ? "/"
        : "^";
    }

    return t < 0.55
      ? "^"
      : "/";
  }

  if (
    hit.material ===
    MATERIAL.LIBRARY
  ) {
    return t < 0.45
      ? "_"
      : "=";
  }

  return t < 0.5
    ? "/"
    : "^";
};

const facadeGlyph = (
  hit,
  row,
  wallTop,
  bottom,
  column,
) => {
  if (hit.tile === TILE.TREE) {
    const pattern =
      "▓▒░:";

    const index =
      Math.min(
        pattern.length - 1,
        Math.floor(
          depthRatio(
            hit.distance,
          ) *
          pattern.length,
        ),
      );

    return pattern[index];
  }

  if (hit.tile === TILE.LOW_WALL) {
    return row === wallTop
      ? "_"
      : "=";
  }

  if (hit.tile === TILE.SHELF) {
    return (
      (
        row +
        column
      ) % 3 === 0
    )
      ? "│"
      : "▒";
  }

  const height =
    Math.max(
      1,
      bottom - wallTop,
    );

  const v =
    (
      row -
      wallTop
    ) /
    height;

  if (
    hit.material ===
    MATERIAL.CHURCH
  ) {
    if (v < 0.05) {
      return "_";
    }

    const windowBand =
      v > 0.3 &&
      v < 0.68;

    if (
      windowBand &&
      (
        hit.x +
        hit.y +
        column
      ) % 7 === 0
    ) {
      return "│";
    }

    if (
      windowBand &&
      (
        hit.x * 3 +
        hit.y +
        column
      ) % 11 === 0
    ) {
      return "○";
    }

    return (
      row +
      hit.x +
      hit.y
    ) % 5 === 0
      ? ":"
      : ".";
  }

  if (
    hit.material ===
    MATERIAL.LIBRARY
  ) {
    if (
      v < 0.06 ||
      v > 0.92
    ) {
      return "=";
    }

    if (
      v > 0.18 &&
      v < 0.78 &&
      (
        column +
        hit.x
      ) % 6 === 0
    ) {
      return "│";
    }

    if (
      v > 0.18 &&
      v < 0.78 &&
      (
        column +
        hit.x
      ) % 6 === 1
    ) {
      return ":";
    }

    return ".";
  }

  if (
    hit.material ===
    MATERIAL.PLASTER
  ) {
    if (
      v > 0.22 &&
      v < 0.72 &&
      (
        column +
        hit.x * 2
      ) % 10 === 0
    ) {
      return "□";
    }

    if (
      v > 0.22 &&
      v < 0.72 &&
      (
        column +
        hit.x * 2
      ) % 10 === 1
    ) {
      return "│";
    }

    return (
      row +
      column +
      hit.y
    ) % 9 === 0
      ? ":"
      : ".";
  }

  if (
    hit.material ===
    MATERIAL.BRICK
  ) {
    if (
      v > 0.2 &&
      v < 0.72 &&
      (
        column +
        hit.x
      ) % 11 === 0
    ) {
      return "□";
    }

    return (
      row +
      column
    ) % 4 === 0
      ? ":"
      : "·";
  }

  return (
    row +
    column
  ) % 5 === 0
    ? ":"
    : ".";
};

const plotLine = (
  buffer,
  colorBuffer,
  depthBuffer,
  projection,
  line,
  color,
) => {
  const start =
    projectShapePoint(
      projection,
      line.x1,
      line.y1,
    );

  const end =
    projectShapePoint(
      projection,
      line.x2,
      line.y2,
    );

  const dx =
    end.x - start.x;

  const dy =
    end.y - start.y;

  const steps =
    Math.max(
      1,
      Math.ceil(
        Math.max(
          Math.abs(dx),
          Math.abs(dy),
        ),
      ),
    );

  for (
    let step = 0;
    step <= steps;
    step += 1
  ) {
    const t =
      step / steps;

    const x =
      Math.round(
        start.x +
        dx * t,
      );

    const y =
      Math.round(
        start.y +
        dy * t,
      );

    if (
      y < 0 ||
      y >= buffer.length ||
      x < 0 ||
      x >= buffer[0].length
    ) {
      continue;
    }

    if (
      projection.correctedDistance >
      depthBuffer[x]
    ) {
      continue;
    }

    buffer[y][x] =
      line.glyph;

    colorBuffer[y][x] =
      color;
  }
};

const renderObjects = (
  buffer,
  colorBuffer,
  depthBuffer,
  world,
  player,
  camera,
  columns,
  rows,
) => {
  const visible = [];

  for (
    const object
    of world.objects
  ) {
    const projection =
      projectObject(
        object,
        player,
        camera,
        columns,
        rows,
      );

    if (!projection) {
      continue;
    }

    visible.push({
      object,
      projection,
    });
  }

  visible.sort(
    (a, b) =>
      b.projection.correctedDistance -
      a.projection.correctedDistance,
  );

  for (
    const {
      object,
      projection,
    }
    of visible
  ) {
    const color =
      object.type ===
        OBJECT_TYPE.ICON
        ? PALETTE.icon
        : PALETTE.grave;

    for (
      const line
      of object.shape
    ) {
      plotLine(
        buffer,
        colorBuffer,
        depthBuffer,
        projection,
        line,
        color,
      );
    }
  }
};

export class Renderer {
  #canvas;
  #context;

  #cellWidth = 3;
  #width = 0;
  #height = 0;

  constructor(canvas) {
    this.#canvas = canvas;

    this.#context =
      canvas.getContext(
        "2d",
        {
          alpha: false,
        },
      );

    this.resize();
  }

  resize() {
    const width =
      this.#canvas.clientWidth;

    const height =
      this.#canvas.clientHeight;

    const ratio =
      window.devicePixelRatio || 1;

    if (
      width === this.#width &&
      height === this.#height
    ) {
      return;
    }

    this.#width =
      width;

    this.#height =
      height;

    this.#canvas.width =
      Math.floor(
        width * ratio,
      );

    this.#canvas.height =
      Math.floor(
        height * ratio,
      );

    this.#context.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0,
    );

    this.#context.textBaseline =
      "top";

    this.#context.font =
      `${WORLD_FONT_SIZE}px ${FONT_STACK}`;

    this.#cellWidth =
      Math.max(
        1,
        Math.ceil(
          this.#context
            .measureText("M")
            .width,
        ),
      );
  }

  render(
    world,
    player,
    camera,
    interaction = null,
  ) {
    this.resize();

    const context =
      this.#context;

    context.font =
      `${WORLD_FONT_SIZE}px ${FONT_STACK}`;

    const columns =
      Math.max(
        1,
        Math.floor(
          this.#width /
          this.#cellWidth,
        ),
      );

    const rows =
      Math.max(
        1,
        Math.floor(
          this.#height /
          WORLD_LINE_HEIGHT,
        ),
      );

    const projection =
      rows /
      (
        2 *
        Math.tan(
          FOV / 2,
        )
      );

    const horizon =
      rows / 2 +
      Math.tan(
        camera.pitch,
      ) *
      projection;

    const buffer =
      Array.from(
        {
          length: rows,
        },
        (_, row) => {
          if (
            row <= horizon
          ) {
            return Array(
              columns,
            ).fill(" ");
          }

          const band =
            Math.min(
              FLOOR_SHADES.length - 1,
              Math.floor(
                (
                  row -
                  horizon
                ) /
                Math.max(
                  1,
                  rows / 11,
                ),
              ),
            );

          return Array(
            columns,
          ).fill(
            FLOOR_SHADES[
            band
            ],
          );
        },
      );

    const colorBuffer =
      Array.from(
        {
          length: rows,
        },
        (_, row) => {
          const color =
            row > horizon
              ? groundColor(
                row,
                horizon,
                rows,
              )
              : PALETTE.background;

          return Array(
            columns,
          ).fill(
            color,
          );
        },
      );

    const depthBuffer =
      Array(
        columns,
      ).fill(
        Infinity,
      );

    for (
      let column = 0;
      column < columns;
      column += 1
    ) {
      const cameraX =
        (
          column + 0.5
        ) /
        columns -
        0.5;

      const rayAngle =
        camera.yaw +
        cameraX * FOV;

      const hit =
        castRay(
          world,
          player.x,
          player.y,
          rayAngle,
        );

      if (!hit) {
        continue;
      }

      const distance =
        Math.max(
          0.001,
          hit.distance *
          Math.cos(
            rayAngle -
            camera.yaw,
          ),
        );

      hit.distance =
        distance;

      depthBuffer[
        column
      ] = distance;

      const bonus =
        roofBonus(hit);

      const visualHeight =
        hit.height +
        bonus;

      const roofTop =
        Math.floor(
          horizon -
          (
            (
              visualHeight -
              player.z
            ) /
            distance
          ) *
          projection,
        );

      const wallTop =
        Math.floor(
          horizon -
          (
            (
              hit.height -
              player.z
            ) /
            distance
          ) *
          projection,
        );

      const bottom =
        Math.ceil(
          horizon +
          (
            player.z /
            distance
          ) *
          projection,
        );

      const wallColor =
        materialColor(
          hit.material,
          distance,
        );

      const roofColor =
        hit.material ===
          MATERIAL.LIBRARY
          ? PALETTE.roofBlue
          : PALETTE.roof;

      const roofStart =
        Math.max(
          0,
          roofTop,
        );

      const roofEnd =
        Math.min(
          rows - 1,
          wallTop - 1,
        );

      for (
        let row =
          roofStart;
        row <= roofEnd;
        row += 1
      ) {
        buffer[row][column] =
          roofGlyph(
            hit,
            row,
            roofTop,
            wallTop,
          );

        colorBuffer[
          row
        ][
          column
        ] = roofColor;
      }

      const wallStart =
        Math.max(
          0,
          wallTop,
        );

      const wallEnd =
        Math.min(
          rows - 1,
          bottom,
        );

      for (
        let row =
          wallStart;
        row <= wallEnd;
        row += 1
      ) {
        buffer[row][column] =
          facadeGlyph(
            hit,
            row,
            wallTop,
            bottom,
            column,
          );

        colorBuffer[
          row
        ][
          column
        ] =
          wallColor;
      }
    }

    renderObjects(
      buffer,
      colorBuffer,
      depthBuffer,
      world,
      player,
      camera,
      columns,
      rows,
    );

    context.fillStyle =
      PALETTE.background;

    context.fillRect(
      0,
      0,
      this.#width,
      this.#height,
    );

    for (
      let row = 0;
      row < rows;
      row += 1
    ) {
      let start = 0;

      while (
        start < columns
      ) {
        const color =
          colorBuffer[
          row
          ][
          start
          ];

        let end =
          start + 1;

        while (
          end < columns &&
          colorBuffer[
          row
          ][
          end
          ] === color
        ) {
          end += 1;
        }

        context.fillStyle =
          color;

        context.fillText(
          buffer[
            row
          ]
            .slice(
              start,
              end,
            )
            .join(""),
          start *
          this.#cellWidth,
          row *
          WORLD_LINE_HEIGHT,
        );

        start =
          end;
      }
    }

    if (
      interaction?.text
    ) {
      const text =
        interaction.text;

      context.font =
        `${UI_FONT_SIZE}px ${FONT_STACK}`;

      const width =
        context
          .measureText(
            text,
          )
          .width;

      const x =
        (
          this.#width -
          width
        ) / 2;

      const y =
        this.#height -
        UI_LINE_HEIGHT *
        2.25;

      context.fillStyle =
        PALETTE.textBackground;

      context.fillRect(
        x - 10,
        y - 4,
        width + 20,
        UI_LINE_HEIGHT + 8,
      );

      context.fillStyle =
        PALETTE.text;

      context.fillText(
        text,
        x,
        y,
      );
    }
  }
}
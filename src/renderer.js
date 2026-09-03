import {
  FOV,
  UI_FONT_SIZE,
  UI_LINE_HEIGHT,
  WORLD_FONT_SIZE,
  WORLD_LINE_HEIGHT,
} from "./config.js";

import {
  MATERIAL,
} from "./architecture.js";

import {
  BUILDING_MESH,
  SURFACE,
} from "./buildings.js";

import {
  TILE,
} from "./map.js";

import {
  OBJECT_TYPE,
} from "./objects.js";

import {
  projectObject,
  projectShapePoint,
} from "./projection.js";

import {
  createDepthBuffer,
  rasterizeMesh,
} from "./rasterizer.js";

import {
  castRay,
} from "./raycast.js";

const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

const PALETTE = Object.freeze({
  backgroundTop: "#0c0d11",
  backgroundMid: "#090a0e",
  backgroundBottom: "#07080a",

  groundNear: "#60686d",
  groundMid: "#474e53",
  groundFar: "#30363a",

  stone: "#85868d",
  plaster: "#96939e",
  brick: "#817987",

  church: "#908a9c",
  churchRoof: "#7b7387",
  dome: "#8b8299",

  library: "#7d909a",
  libraryRoof: "#6a7e88",

  houseRoof: "#736e79",

  tree: "#788b95",
  lowWall: "#80838a",
  shelf: "#898292",

  grave: "#9d9aa2",
  icon: "#9c92aa",
  cross: "#bbb4c1",

  text: "#d4dadd",
  textBackground: "#090a0c",
});

const FLOOR_SHADES = [
  ".",
  ".",
  "·",
  ".",
];

const styleForMaterial = (
  material,
) => {
  switch (material) {
    case MATERIAL.CHURCH:
      return {
        color: PALETTE.church,
        glyphs: [
          ".",
          "·",
          ":",
          ".",
        ],
        pattern: {
          interval: 11,
          glyph: ":",
        },
      };

    case MATERIAL.LIBRARY:
      return {
        color: PALETTE.library,
        glyphs: [
          ".",
          ":",
          "·",
          ".",
        ],
        pattern: {
          interval: 13,
          glyph: "│",
        },
      };

    case MATERIAL.PLASTER:
      return {
        color: PALETTE.plaster,
        glyphs: [
          ".",
          "·",
          ":",
          ".",
        ],
        pattern: {
          interval: 17,
          glyph: ":",
        },
      };

    case MATERIAL.BRICK:
      return {
        color: PALETTE.brick,
        glyphs: [
          ":",
          "·",
          ".",
          ".",
        ],
        pattern: {
          interval: 8,
          glyph: ":",
        },
      };

    case MATERIAL.STONE:
      return {
        color: PALETTE.stone,
        glyphs: [
          ".",
          ":",
          "·",
          ".",
        ],
      };

    case SURFACE.CHURCH_ROOF:
      return {
        color: PALETTE.churchRoof,
        glyphs: [
          "/",
          "^",
          ".",
          ".",
        ],
        pattern: {
          interval: 7,
          glyph: "/",
        },
      };

    case SURFACE.CHURCH_DOME:
      return {
        color: PALETTE.dome,
        glyphs: [
          ".",
          "·",
          ":",
          ".",
        ],
        pattern: {
          interval: 9,
          glyph: "·",
        },
      };

    case SURFACE.HOUSE_ROOF:
      return {
        color: PALETTE.houseRoof,
        glyphs: [
          "/",
          "^",
          ".",
          ".",
        ],
        pattern: {
          interval: 8,
          glyph: "/",
        },
      };

    case SURFACE.LIBRARY_ROOF:
      return {
        color: PALETTE.libraryRoof,
        glyphs: [
          "_",
          "=",
          ".",
          ".",
        ],
      };

    case SURFACE.CROSS:
      return {
        color: PALETTE.cross,
        glyphs: [
          "†",
          "†",
          "+",
          ".",
        ],
      };

    default:
      return null;
  }
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

const paintBackdrop = (
  context,
  width,
  height,
) => {
  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      height,
    );

  gradient.addColorStop(
    0,
    PALETTE.backgroundTop,
  );

  gradient.addColorStop(
    0.6,
    PALETTE.backgroundMid,
  );

  gradient.addColorStop(
    1,
    PALETTE.backgroundBottom,
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    width,
    height,
  );
};

const renderRayGeometry = (
  buffer,
  colorBuffer,
  depthBuffer,
  world,
  player,
  camera,
  columns,
  rows,
) => {
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

    if (
      hit.tile !== TILE.TREE &&
      hit.tile !== TILE.LOW_WALL &&
      hit.tile !== TILE.SHELF
    ) {
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

    const top =
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

    let glyph = ".";
    let color =
      PALETTE.stone;

    if (
      hit.tile === TILE.TREE
    ) {
      glyph =
        distance < 8
          ? "▒"
          : "░";

      color =
        PALETTE.tree;
    }

    if (
      hit.tile ===
      TILE.LOW_WALL
    ) {
      glyph =
        distance < 8
          ? "="
          : "-";

      color =
        PALETTE.lowWall;
    }

    if (
      hit.tile ===
      TILE.SHELF
    ) {
      glyph =
        distance < 8
          ? "▓"
          : "▒";

      color =
        PALETTE.shelf;
    }

    const start =
      Math.max(
        0,
        top,
      );

    const end =
      Math.min(
        rows - 1,
        bottom,
      );

    for (
      let row = start;
      row <= end;
      row += 1
    ) {
      if (
        distance >=
        depthBuffer[row][column]
      ) {
        continue;
      }

      depthBuffer[row][column] =
        distance;

      buffer[row][column] =
        glyph;

      colorBuffer[row][column] =
        color;
    }
  }
};

const plotObjectLine = (
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
      projection.correctedDistance >=
      depthBuffer[y][x]
    ) {
      continue;
    }

    depthBuffer[y][x] =
      projection.correctedDistance;

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
      plotObjectLine(
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
    this.#canvas =
      canvas;

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
      window.devicePixelRatio ||
      1;

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
              : PALETTE.backgroundBottom;

          return Array(
            columns,
          ).fill(
            color,
          );
        },
      );

    const depthBuffer =
      createDepthBuffer(
        rows,
        columns,
      );

    const cellAspect =
      this.#cellWidth /
      WORLD_LINE_HEIGHT;

    rasterizeMesh({
      mesh:
        BUILDING_MESH,

      player,
      camera,

      columns,
      rows,

      cellAspect,

      buffer,
      colorBuffer,
      depthBuffer,

      styleForMaterial,
    });

    renderRayGeometry(
      buffer,
      colorBuffer,
      depthBuffer,
      world,
      player,
      camera,
      columns,
      rows,
    );

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

    paintBackdrop(
      context,
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
          buffer[row]
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
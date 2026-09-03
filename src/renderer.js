import {
  FOV,
  MAX_DEPTH,
  UI_FONT_SIZE,
  UI_LINE_HEIGHT,
  WORLD_FONT_SIZE,
  WORLD_LINE_HEIGHT,
} from "./config.js";

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
  background: "#050608",

  groundNear: "#5b6268",
  groundMid: "#454b52",
  groundFar: "#30353b",

  wallNear: "#a3a0aa",
  wallMid: "#7b7885",
  wallFar: "#55535e",

  lavender: "#8d879d",
  blue: "#7f919b",
  grey: "#85898c",

  grave: "#9a969e",
  icon: "#9991aa",

  text: "#c7d0d4",
  textBackground: "#08090b",
});

const WALL_SHADES = "@#%*+=-:.";
const TREE_SHADES = "▓▒░:";
const FLOOR_SHADES = [".", "·", "."];

const depthRatio = (distance) =>
  Math.min(1, distance / MAX_DEPTH);

const wallGlyph = (
  tile,
  distance,
  side,
) => {
  const depth = depthRatio(distance);

  if (tile === TILE.TREE) {
    const index = Math.min(
      TREE_SHADES.length - 1,
      Math.floor(
        depth * TREE_SHADES.length,
      ),
    );

    return TREE_SHADES[index];
  }

  if (tile === TILE.SHELF) {
    return distance < 8 ? "▓" : "▒";
  }

  if (tile === TILE.LOW_WALL) {
    return distance < 8 ? "=" : "-";
  }

  const index = Math.min(
    WALL_SHADES.length - 1,
    Math.floor(
      depth * WALL_SHADES.length,
    ) + side,
  );

  return WALL_SHADES[index];
};

const wallColor = (
  tile,
  distance,
) => {
  const depth = depthRatio(distance);

  if (tile === TILE.TREE) {
    return depth < 0.35
      ? PALETTE.blue
      : PALETTE.wallFar;
  }

  if (tile === TILE.SHELF) {
    return PALETTE.lavender;
  }

  if (tile === TILE.LOW_WALL) {
    return PALETTE.grey;
  }

  if (depth < 0.28) {
    return PALETTE.wallNear;
  }

  if (depth < 0.62) {
    return PALETTE.wallMid;
  }

  return PALETTE.wallFar;
};

const groundColor = (
  row,
  horizon,
  rows,
) => {
  const distance =
    (row - horizon) /
    Math.max(1, rows - horizon);

  if (distance > 0.65) {
    return PALETTE.groundNear;
  }

  if (distance > 0.25) {
    return PALETTE.groundMid;
  }

  return PALETTE.groundFar;
};

const plotLine = (
  buffer,
  colorBuffer,
  depthBuffer,
  projection,
  line,
  color,
) => {
  const start = projectShapePoint(
    projection,
    line.x1,
    line.y1,
  );

  const end = projectShapePoint(
    projection,
    line.x2,
    line.y2,
  );

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const steps = Math.max(
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
    const t = step / steps;

    const x = Math.round(
      start.x + dx * t,
    );

    const y = Math.round(
      start.y + dy * t,
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

    buffer[y][x] = line.glyph;
    colorBuffer[y][x] = color;
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

  for (const object of world.objects) {
    const projection = projectObject(
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
    } of visible
  ) {
    const color =
      object.type === OBJECT_TYPE.ICON
        ? PALETTE.icon
        : PALETTE.grave;

    for (const line of object.shape) {
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
        { alpha: false },
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

    this.#width = width;
    this.#height = height;

    this.#canvas.width =
      Math.floor(width * ratio);

    this.#canvas.height =
      Math.floor(height * ratio);

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
          this.#context.measureText(
            "M",
          ).width,
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

    const columns = Math.max(
      1,
      Math.floor(
        this.#width /
        this.#cellWidth,
      ),
    );

    const rows = Math.max(
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
        Math.tan(FOV / 2)
      );

    const horizon =
      rows / 2 +
      Math.tan(camera.pitch) *
      projection;

    const buffer =
      Array.from(
        { length: rows },
        (_, row) => {
          const ground =
            row > horizon;

          if (!ground) {
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
                  rows / 10,
                ),
              ),
            );

          return Array(
            columns,
          ).fill(
            FLOOR_SHADES[band],
          );
        },
      );

    const colorBuffer =
      Array.from(
        { length: rows },
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
          ).fill(color);
        },
      );

    const depthBuffer =
      Array(columns).fill(
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

      const hit = castRay(
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

      depthBuffer[column] =
        distance;

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

      const glyph =
        wallGlyph(
          hit.tile,
          distance,
          hit.side,
        );

      const color =
        wallColor(
          hit.tile,
          distance,
        );

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
        buffer[row][column] =
          glyph;

        colorBuffer[row][column] =
          color;
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

      while (start < columns) {
        const color =
          colorBuffer[row][start];

        let end =
          start + 1;

        while (
          end < columns &&
          colorBuffer[row][end] ===
          color
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

        start = end;
      }
    }

    if (interaction?.text) {
      const text =
        interaction.text;

      context.font =
        `${UI_FONT_SIZE}px ${FONT_STACK}`;

      const width =
        context.measureText(
          text,
        ).width;

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
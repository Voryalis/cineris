import {
  FONT_SIZE,
  FOV,
  LINE_HEIGHT,
  MAX_DEPTH,
} from "./config.js";

import { TILE } from "./map.js";
import { castRay } from "./raycast.js";

import {
  projectObject,
  projectShapePoint,
} from "./projection.js";

const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

const WALL_SHADES = "@#%*+=-:.";
const TREE_SHADES = "▓▒░:";
const FLOOR_SHADES = ".· ";

const wallGlyph = (tile, distance, side) => {
  const depth = Math.min(
    1,
    distance / MAX_DEPTH,
  );

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

const plotLine = (
  buffer,
  depthBuffer,
  projection,
  line,
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
  }
};

const renderObjects = (
  buffer,
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

    if (!projection) continue;

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
    for (const line of object.shape) {
      plotLine(
        buffer,
        depthBuffer,
        projection,
        line,
      );
    }
  }
};

export class Renderer {
  #canvas;
  #context;

  #cellWidth = 10;
  #width = 0;
  #height = 0;

  constructor(canvas) {
    this.#canvas = canvas;

    this.#context = canvas.getContext(
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

    this.#context.font =
      `${FONT_SIZE}px ${FONT_STACK}`;

    this.#context.textBaseline =
      "top";

    this.#cellWidth =
      Math.ceil(
        this.#context.measureText(
          "M",
        ).width,
      );
  }

  render(
    world,
    player,
    camera,
    interaction = null,
  ) {
    this.resize();

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
        LINE_HEIGHT,
      ),
    );

    const projection =
      rows /
      (2 *
        Math.tan(FOV / 2));

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

          const depth =
            ground
              ? Math.min(
                2,
                Math.floor(
                  (row - horizon) /
                  Math.max(
                    1,
                    rows / 12,
                  ),
                ),
              )
              : 2;

          return Array(
            columns,
          ).fill(
            ground
              ? FLOOR_SHADES[
              depth
              ]
              : " ",
          );
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
        (column + 0.5) /
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

      if (!hit) continue;

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
          ((hit.height -
            player.z) /
            distance) *
          projection,
        );

      const bottom =
        Math.ceil(
          horizon +
          (player.z /
            distance) *
          projection,
        );

      const glyph =
        wallGlyph(
          hit.tile,
          distance,
          hit.side,
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
      }
    }

    renderObjects(
      buffer,
      depthBuffer,
      world,
      player,
      camera,
      columns,
      rows,
    );

    const centerX =
      Math.floor(
        columns / 2,
      );

    const centerY =
      Math.floor(
        rows / 2,
      );

    if (
      centerY >= 0 &&
      centerY < rows &&
      centerX >= 0 &&
      centerX < columns
    ) {
      buffer[centerY][centerX] =
        "+";
    }

    const context =
      this.#context;

    context.fillStyle =
      "#050608";

    context.fillRect(
      0,
      0,
      this.#width,
      this.#height,
    );

    context.fillStyle =
      "#d6e5df";

    for (
      let row = 0;
      row < rows;
      row += 1
    ) {
      context.fillText(
        buffer[row].join(""),
        0,
        row * LINE_HEIGHT,
      );
    }

    if (interaction?.text) {
      const text =
        interaction.text;

      context.font =
        `${FONT_SIZE}px ${FONT_STACK}`;

      const width =
        context.measureText(
          text,
        ).width;

      context.fillStyle =
        "#050608";

      context.fillRect(
        (
          this.#width -
          width
        ) / 2 - 8,
        this.#height -
        LINE_HEIGHT * 2.5,
        width + 16,
        LINE_HEIGHT + 6,
      );

      context.fillStyle =
        "#e8eee9";

      context.fillText(
        text,
        (
          this.#width -
          width
        ) / 2,
        this.#height -
        LINE_HEIGHT * 2.3,
      );
    }
  }
}
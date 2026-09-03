import {
  FONT_SIZE,
  FOV,
  LINE_HEIGHT,
  MAX_DEPTH,
} from "./config.js";

import { castRay } from "./raycast.js";

const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

const SHADES = "@#%*+=-:.";

const shadeFor = (distance, side) => {
  const depth = Math.min(
    1,
    distance / MAX_DEPTH,
  );

  const index = Math.min(
    SHADES.length - 1,
    Math.floor(depth * SHADES.length) + side,
  );

  return SHADES[index];
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
    const width = this.#canvas.clientWidth;
    const height = this.#canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;

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

    this.#context.textBaseline = "top";

    this.#cellWidth = Math.ceil(
      this.#context.measureText("M").width,
    );
  }

  render(world, player, camera) {
    this.resize();

    const columns = Math.max(
      1,
      Math.floor(
        this.#width / this.#cellWidth,
      ),
    );

    const rows = Math.max(
      1,
      Math.floor(
        this.#height / LINE_HEIGHT,
      ),
    );

    const projection =
      rows /
      (2 * Math.tan(FOV / 2));

    const horizon =
      rows / 2 +
      Math.tan(camera.pitch) *
      projection;

    const buffer = Array.from(
      { length: rows },
      (_, row) =>
        Array(columns).fill(
          row > horizon ? "." : " ",
        ),
    );

    for (
      let column = 0;
      column < columns;
      column += 1
    ) {
      const cameraX =
        (column + 0.5) / columns - 0.5;

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

      const distance = Math.max(
        0.001,
        hit.distance *
        Math.cos(
          rayAngle - camera.yaw,
        ),
      );

      const top = Math.floor(
        horizon -
        ((hit.height - player.z) /
          distance) *
        projection,
      );

      const bottom = Math.ceil(
        horizon +
        (player.z / distance) *
        projection,
      );

      const glyph = shadeFor(
        distance,
        hit.side,
      );

      const start = Math.max(0, top);
      const end = Math.min(
        rows - 1,
        bottom,
      );

      for (
        let row = start;
        row <= end;
        row += 1
      ) {
        buffer[row][column] = glyph;
      }
    }

    const context = this.#context;

    context.fillStyle = "#050608";

    context.fillRect(
      0,
      0,
      this.#width,
      this.#height,
    );

    context.fillStyle = "#d6e5df";

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
  }
}
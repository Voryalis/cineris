import { FONT_SIZE, LINE_HEIGHT } from "./config.js";

const FONT_STACK = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

export class Renderer {
  #canvas;
  #context;
  #cellWidth = 10;
  #width = 0;
  #height = 0;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#context = canvas.getContext("2d", { alpha: false });
    this.resize();
  }

  resize() {
    const width = this.#canvas.clientWidth;
    const height = this.#canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;

    if (width === this.#width && height === this.#height) return;

    this.#width = width;
    this.#height = height;
    this.#canvas.width = Math.floor(width * ratio);
    this.#canvas.height = Math.floor(height * ratio);

    this.#context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.#context.font = `${FONT_SIZE}px ${FONT_STACK}`;
    this.#context.textBaseline = "top";
    this.#cellWidth = Math.ceil(this.#context.measureText("M").width);
  }

  render(world, player) {
    this.resize();

    const context = this.#context;
    const columns = Math.max(1, Math.ceil(this.#width / this.#cellWidth));
    const rows = Math.max(1, Math.ceil(this.#height / LINE_HEIGHT));
    const cameraX = Math.max(0, Math.min(world.width - columns, player.x - Math.floor(columns / 2)));
    const cameraY = Math.max(0, Math.min(world.height - rows, player.y - Math.floor(rows / 2)));

    context.fillStyle = "#050608";
    context.fillRect(0, 0, this.#width, this.#height);
    context.fillStyle = "#7f8c86";

    for (let screenY = 0; screenY < rows; screenY += 1) {
      const worldY = cameraY + screenY;
      if (worldY >= world.height) break;

      let line = "";
      for (let screenX = 0; screenX < columns; screenX += 1) {
        const worldX = cameraX + screenX;
        line += worldX < world.width ? world.glyphAt(worldX, worldY) : " ";
      }

      context.fillText(line, 0, screenY * LINE_HEIGHT);
    }

    const playerX = (player.x - cameraX) * this.#cellWidth;
    const playerY = (player.y - cameraY) * LINE_HEIGHT;
    context.fillStyle = "#e8fff4";
    context.fillText(player.glyph, playerX, playerY);
  }
}

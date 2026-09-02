import { MOVE_INTERVAL } from "./config.js";

export class Engine {
  #input;
  #player;
  #renderer;
  #world;
  #lastTime = 0;
  #moveTime = 0;
  #frameId = 0;

  constructor({ input, player, renderer, world }) {
    this.#input = input;
    this.#player = player;
    this.#renderer = renderer;
    this.#world = world;
  }

  start() {
    if (this.#frameId) return;
    this.#frameId = requestAnimationFrame(this.#frame);
  }

  stop() {
    cancelAnimationFrame(this.#frameId);
    this.#frameId = 0;
    this.#lastTime = 0;
    this.#moveTime = 0;
  }

  #frame = (time) => {
    const delta = this.#lastTime ? Math.min(time - this.#lastTime, 100) : 0;
    this.#lastTime = time;
    this.#moveTime += delta;

    const direction = this.#input.direction();
    if (!direction) {
      this.#moveTime = MOVE_INTERVAL;
    } else if (this.#moveTime >= MOVE_INTERVAL) {
      this.#player.move(direction[0], direction[1], this.#world);
      this.#moveTime = 0;
    }

    this.#renderer.render(this.#world, this.#player);
    this.#frameId = requestAnimationFrame(this.#frame);
  };
}

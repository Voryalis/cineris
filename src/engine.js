import {
  MOUSE_SENSITIVITY,
  TURN_SPEED,
} from "./config.js";

export class Engine {
  #camera;
  #input;
  #interaction;
  #player;
  #renderer;
  #world;

  #lastTime = 0;
  #frameId = 0;

  constructor({
    camera,
    input,
    interaction,
    player,
    renderer,
    world,
  }) {
    this.#camera = camera;
    this.#input = input;
    this.#interaction = interaction;
    this.#player = player;
    this.#renderer = renderer;
    this.#world = world;
  }

  start() {
    if (this.#frameId) return;

    this.#frameId =
      requestAnimationFrame(this.#frame);
  }

  stop() {
    cancelAnimationFrame(this.#frameId);

    this.#frameId = 0;
    this.#lastTime = 0;
  }

  #frame = (time) => {
    const delta = this.#lastTime
      ? Math.min(
        (time - this.#lastTime) / 1000,
        0.05,
      )
      : 0;

    this.#lastTime = time;

    const mouse =
      this.#input.consumeMouse();

    const look =
      this.#input.look();

    this.#camera.rotate(
      mouse.x * MOUSE_SENSITIVITY +
      look.yaw * TURN_SPEED * delta,

      -mouse.y * MOUSE_SENSITIVITY +
      look.pitch * TURN_SPEED * delta,
    );

    const movement =
      this.#input.movement();

    this.#player.move(
      movement.forward,
      movement.strafe,
      this.#camera.yaw,
      delta,
      this.#world,
    );

    this.#interaction.update(
      this.#world,
      this.#player,
      this.#camera,
    );

    this.#renderer.render(
      this.#world,
      this.#player,
      this.#camera,
      this.#interaction,
    );

    this.#frameId =
      requestAnimationFrame(this.#frame);
  };
}
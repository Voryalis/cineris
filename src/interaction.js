import { castRay } from "./raycast.js";

const INTERACTION_DISTANCE = 2.2;

export class Interaction {
  text = null;

  update(world, player, camera) {
    const hit = castRay(
      world,
      player.x,
      player.y,
      camera.yaw,
    );

    if (
      !hit ||
      hit.distance > INTERACTION_DISTANCE
    ) {
      this.text = null;
      return;
    }

    if (hit.label) {
      this.text = hit.label;
      return;
    }

    if (hit.landmark) {
      this.text = hit.landmark;
      return;
    }

    this.text = null;
  }
}
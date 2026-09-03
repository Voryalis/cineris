import {
  EYE_HEIGHT,
  MOVE_SPEED,
  PLAYER_RADIUS,
} from "./config.js";

export class Player {
  x = 2.5;
  y = 2.5;
  z = EYE_HEIGHT;

  radius = PLAYER_RADIUS;

  move(forward, strafe, yaw, delta, world) {
    const length = Math.hypot(forward, strafe);

    if (!length) return;

    const scale =
      (MOVE_SPEED * delta) /
      Math.max(1, length);

    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);

    const dx =
      (forward * cos - strafe * sin) *
      scale;

    const dy =
      (forward * sin + strafe * cos) *
      scale;

    const nextX = this.x + dx;

    if (
      world.canOccupy(
        nextX,
        this.y,
        this.radius,
      )
    ) {
      this.x = nextX;
    }

    const nextY = this.y + dy;

    if (
      world.canOccupy(
        this.x,
        nextY,
        this.radius,
      )
    ) {
      this.y = nextY;
    }
  }
}
import { castRay } from "./raycast.js";

const MAX_DISTANCE = 3.2;
const AIM_ANGLE = 0.12;

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

export class Interaction {
  text = null;

  update(world, player, camera) {
    this.text = null;

    const wallHit = castRay(
      world,
      player.x,
      player.y,
      camera.yaw,
    );

    let best = null;

    for (const object of world.objects) {
      const dx = object.x - player.x;
      const dy = object.y - player.y;

      const distance = Math.hypot(dx, dy);

      if (
        distance > MAX_DISTANCE ||
        distance < 0.05
      ) {
        continue;
      }

      const angle = Math.atan2(dy, dx);

      const difference = Math.abs(
        normalizeAngle(
          angle - camera.yaw,
        ),
      );

      const angularSize =
        Math.atan2(
          object.width * 0.5,
          distance,
        );

      if (
        difference >
        AIM_ANGLE + angularSize
      ) {
        continue;
      }

      if (
        wallHit &&
        wallHit.distance <
        distance - object.width * 0.35
      ) {
        continue;
      }

      if (
        !best ||
        distance < best.distance
      ) {
        best = {
          object,
          distance,
        };
      }
    }

    if (best) {
      this.text =
        best.object.label;

      return;
    }

    if (
      wallHit &&
      wallHit.distance <= MAX_DISTANCE &&
      wallHit.landmark
    ) {
      this.text =
        wallHit.landmark;
    }
  }
}
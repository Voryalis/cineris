export class Player {
  x = 1;
  y = 1;
  glyph = "@";

  move(dx, dy, world) {
    const nextX = this.x + dx;
    const nextY = this.y + dy;

    if (!world.isWalkable(nextX, nextY)) return false;

    this.x = nextX;
    this.y = nextY;
    return true;
  }
}

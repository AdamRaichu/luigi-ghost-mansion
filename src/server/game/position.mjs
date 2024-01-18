import { Role } from "../../common/role.mjs";

export const Directions = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
};

export class PositionTracker {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  move(dir, distance) {
    switch (dir) {
      case Directions.UP:
        this.y -= distance;
        break;
      case Directions.DOWN:
        this.y += distance;
        break;
      case Directions.LEFT:
        this.x -= distance;
        break;
      case Directions.RIGHT:
        this.x += distance;
        break;
      default:
        throw new TypeError("Invalid direction.");
    }
  }
}

export class StartingPositions {
  /**
   *
   * @param {PositionTracker} ghost
   * @param {PositionTracker} luigi1
   * @param {PositionTracker} luigi2
   * @param {PositionTracker} luigi3
   * @param {PositionTracker} luigi4
   */
  constructor(ghost, luigi1, luigi2, luigi3, luigi4) {
    this[Role.ghost] = ghost;
    this[Role.luigi1] = luigi1;
    this[Role.luigi2] = luigi2;
    this[Role.luigi3] = luigi3;
    this[Role.luigi4] = luigi4;
  }
}

export class MathUtils {
  /**
   * @typedef Point
   * @property {number} x
   * @property {number} y
   */
  /**
   * Check if a point is within a triangle.
   *
   * From {@link https://jsfiddle.net/PerroAZUL/zdaY8/1/ jsfiddle.net}.
   * @param {Point} p
   * @param {Point} p0
   * @param {Point} p1
   * @param {Point} p2
   * @returns
   */
  static ptInTriangle(p, p0, p1, p2) {
    var A = (1 / 2) * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    var sign = A < 0 ? -1 : 1;
    var s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    var t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;

    return s > 0 && t > 0 && s + t < 2 * A * sign;
  }

  /**
   * Find the location of a point given an origin, rotation (in degrees), and distance.
   *
   * From {@link https://stackoverflow.com/a/4457380/17115294 stackoverflow.com}.
   * @param {number} originX
   * @param {number} originY
   * @param {number} rotation
   * @param {number} distance
   * @returns
   */
  static findPointFromRotation(originX, originY, rotation, distance) {
    return {
      x: distance * Math.cos((rotation * Math.PI) / 180) + originX,
      y: distance * Math.sin((rotation * Math.PI) / 180) + originY,
    };
  }
}

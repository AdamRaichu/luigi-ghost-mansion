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
   * @returns {Point}
   */
  static findPointFromRotation(originX, originY, rotation, distance) {
    return {
      x: distance * Math.cos((rotation * Math.PI) / 180) + originX,
      y: distance * Math.sin((rotation * Math.PI) / 180) + originY,
    };
  }

  /**
   * Helper function to determine whether there is an intersection between the two polygons described
   * by the lists of vertices. Uses the Separating Axis Theorem
   *
   * From {@link https://stackoverflow.com/a/12414951/17115294 stackoverflow.com}.
   *
   * @param {Point[]} a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
   * @param {Point[]} b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
   * @return {boolean} `true` if there is any intersection between the 2 polygons, `false` otherwise
   */
  static doPolygonsIntersect(a, b) {
    const polygons = [a, b];
    let minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {
      // for each polygon, look at each edge of the polygon, and determine if it separates
      // the two shapes
      const polygon = polygons[i];
      for (i1 = 0; i1 < polygon.length; i1++) {
        // grab 2 vertices to create an edge
        const i2 = (i1 + 1) % polygon.length;
        const p1 = polygon[i1];
        const p2 = polygon[i2];

        // find the line perpendicular to this edge
        const normal = { x: p2.y - p1.y, y: p1.x - p2.x };

        minA = maxA = undefined;
        // for each vertex in the first shape, project it onto the line perpendicular to the edge
        // and keep track of the min and max of these values
        for (j = 0; j < a.length; j++) {
          projected = normal.x * a[j].x + normal.y * a[j].y;
          if (minA === undefined || projected < minA) {
            minA = projected;
          }
          if (maxA === undefined || projected > maxA) {
            maxA = projected;
          }
        }

        // for each vertex in the second shape, project it onto the line perpendicular to the edge
        // and keep track of the min and max of these values
        minB = maxB = undefined;
        for (j = 0; j < b.length; j++) {
          projected = normal.x * b[j].x + normal.y * b[j].y;
          if (minB === undefined || projected < minB) {
            minB = projected;
          }
          if (maxB === undefined || projected > maxB) {
            maxB = projected;
          }
        }

        // if there is no overlap between the projects, the edge we are looking at separates the two
        // polygons, and we know there is no overlap
        if (maxA < minB || maxB < minA) {
          return false;
        }
      }
    }
    return true;
  }
}

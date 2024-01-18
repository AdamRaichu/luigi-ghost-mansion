import { Drawable, DrawableWall } from "../../common/drawable.mjs";
import { PositionTracker, StartingPositions } from "./position.mjs";

const basicMapWidth = 360;
const basicWallWidth = 30;

export class GameMap {
  static BASIC = new GameMap(
    "Basic",
    new StartingPositions(
      new PositionTracker(basicMapWidth / 2, basicMapWidth / 2),
      new PositionTracker(basicWallWidth, basicWallWidth),
      new PositionTracker(basicMapWidth - basicWallWidth, basicWallWidth),
      new PositionTracker(basicWallWidth, basicMapWidth - basicWallWidth),
      new PositionTracker(basicMapWidth - basicWallWidth, basicMapWidth - basicWallWidth)
    ),
    [
      new DrawableWall(0, 0, basicMapWidth, basicWallWidth),
      new DrawableWall(basicMapWidth - basicWallWidth, 0, basicWallWidth, basicMapWidth),
      new DrawableWall(0, 0, basicWallWidth, basicMapWidth),
      new DrawableWall(0, basicMapWidth - basicWallWidth, basicMapWidth, basicWallWidth),
    ]
  );

  static randomMap() {
    return this.BASIC;
  }

  name;
  renderData;
  positions;

  /**
   *
   * @param {string} name The human-readable name of the map.
   * @param {StartingPositions} positions An object containing the starting positions of the players.
   * @param {Drawable[]} renderData The render data for the map (like walls).
   */
  constructor(name, positions, renderData) {
    this.name = name;
    this.positions = positions;
    this.renderData = renderData;
  }

  getRenderData() {
    const raw = JSON.parse(JSON.stringify(this.renderData));
    var clonedRenderData = [];
    for (const jsonData of raw) {
      clonedRenderData.push(Drawable.fromJSON(jsonData));
    }
    return clonedRenderData;
  }
}

import { Drawable, DrawableWall } from "../../common/drawable.mjs";

const basicMapWidth = 300;
const basicWallWidth = 30;

export class GameMap {
  static BASIC = new GameMap("Basic", [
    new DrawableWall(0, 0, basicMapWidth, basicWallWidth),
    new DrawableWall(basicMapWidth - basicWallWidth, 0, basicWallWidth, basicMapWidth),
    new DrawableWall(0, 0, basicWallWidth, basicMapWidth),
    new DrawableWall(0, basicMapWidth - basicWallWidth, basicMapWidth, basicWallWidth),
  ]);

  static randomMap() {
    return this.BASIC;
  }

  name;
  renderData;

  /**
   *
   * @param {Drawable[]} renderData
   */
  constructor(name, renderData) {
    this.name = name;
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

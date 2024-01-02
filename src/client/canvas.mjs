export class CanvasUtils {
  ctx;
  height;
  width;

  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

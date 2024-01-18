import { MathUtils } from "./math.mjs";

function getAsJSON(type, args) {
  return {
    type,
    args,
  };
}

/**
 * @typedef Point
 * @property {number} x
 * @property {number} y
 */

export class Drawable {
  static context;

  static setContext(ctx) {
    Drawable.context = ctx;
  }

  static fromJSON(jsonData) {
    switch (jsonData.type) {
      case "DrawableWall":
        return new DrawableWall(...jsonData.args);

      case "DrawableImage":
        return new DrawableImage(...jsonData.args);

      case "DrawableTriangle":
        return new DrawableTriangle(...jsonData.args);

      default:
        console.error(new TypeError(`Unknown Drawable instance type ${jsonData.type}.`));
        break;
    }
  }

  drawFunction;

  constructor(drawFunction) {
    this.drawFunction = drawFunction;
  }

  draw() {
    this.drawFunction(Drawable.context);
  }

  pointIsWithin(x, y) {
    throw new ReferenceError("Unimplemented method pointIsWithin");
  }

  /**
   * @returns {Point[]} The corners of this Drawable.
   */
  getCorners() {
    throw new ReferenceError("Unimplemented method getCorners");
  }

  /**
   * Check if this Drawable intersects with another.
   * @param {Drawable} other
   * @returns {boolean} `true` if they intersect. Otherwise, `false`.
   */
  intersects(other) {
    return MathUtils.doPolygonsIntersect(this.getCorners(), other.getCorners());
  }
}

export class DrawableWall extends Drawable {
  static wallColor = "#412b0a";
  x;
  y;
  w;
  h;
  color;

  constructor(x, y, w, h, color) {
    super(function (ctx) {
      ctx.fillStyle = color ?? DrawableWall.wallColor;
      ctx.fillRect(x, y, w, h);
    });
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
  }

  toJSON() {
    return getAsJSON("DrawableWall", [this.x, this.y, this.w, this.h, this.color]);
  }

  pointIsWithin(pointX, pointY) {
    return pointX > this.x && pointX < this.x + this.w && pointY > this.y && pointY < this.y + this.h;
  }

  getCorners() {
    return [
      {
        x: this.x,
        y: this.y,
      },
      {
        x: this.x + this.w,
        y: this.y,
      },
      {
        x: this.x,
        y: this.y + this.h,
      },
      {
        x: this.x + this.w,
        y: this.y + this.h,
      },
    ];
  }
}

export class DrawableImage extends Drawable {
  x;
  y;
  rot;
  imgName;

  /**
   *
   * @param {"ghost.jpg"|"luigi.png"|"test.jpg"|"luigi_rect.png"} imageName The image to use from the images folder.
   * @param {number} xPos
   * @param {number} yPos
   * @param {number} rotation
   */
  constructor(imageName, xPos, yPos, rotation) {
    super(function (ctx) {
      const image = DrawableImage.getOrCreateImage(imageName);
      ctx.setTransform(1, 0, 0, 1, xPos, yPos);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });
    this.imgName = imageName;
    this.x = xPos;
    this.y = yPos;
    this.rot = rotation;
  }

  static getOrCreateImage(name) {
    if (typeof document === "undefined") {
      console.error(new ReferenceError("Cannot reference `document` object on server side"));
    }
    const possibleImage = document.querySelector(`img[data-name='${name}']`);
    /**
     * @type {HTMLImageElement}
     */
    var returnImage;
    if (possibleImage === null) {
      returnImage = document.createElement("img");
      returnImage.dataset.name = name;
      returnImage.src = `./images/${name}`;
      document.getElementById("sprites").appendChild(returnImage);
    } else {
      returnImage = possibleImage;
    }

    return returnImage;
  }

  toJSON() {
    return getAsJSON("DrawableImage", [this.imgName, this.x, this.y, this.rot]);
  }

  getCorners() {
    const image = DrawableImage.getOrCreateImage(this.imgName);
    return [
      MathUtils.findPointFromRotation(this.x, this.y, this.rot - 45, Math.sqrt((image.naturalWidth / 2) ** 2 + (image.naturalHeight / 2) ** 2)),
      MathUtils.findPointFromRotation(this.x, this.y, this.rot + 45, Math.sqrt((image.naturalWidth / 2) ** 2 + (image.naturalHeight / 2) ** 2)),
      MathUtils.findPointFromRotation(this.x, this.y, this.rot + 135, Math.sqrt((image.naturalWidth / 2) ** 2 + (image.naturalHeight / 2) ** 2)),
      MathUtils.findPointFromRotation(this.x, this.y, this.rot - 135, Math.sqrt((image.naturalWidth / 2) ** 2 + (image.naturalHeight / 2) ** 2)),
    ];
  }

  pointIsWithin(pointX, pointY) {
    const corners = this.getCorners();
    const isInUpperLeftHalf = MathUtils.ptInTriangle({ x: pointX, y: pointY }, corners.bottomLeft, corners.topRight, corners.topLeft);
    const isInLowerRightHalf = MathUtils.ptInTriangle({ x: pointX, y: pointY }, corners.bottomLeft, corners.topRight, corners.bottomRight);
    return isInUpperLeftHalf || isInLowerRightHalf;
  }
}

export class DrawableTriangle extends Drawable {
  static lightColor = "yellow";

  constructor(x1, y1, x2, y2, x3, y3, color) {
    super(function (ctx) {
      ctx.fillStyle = color ?? DrawableTriangle.lightColor;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    });
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.color = color;
  }

  toJSON() {
    return getAsJSON("DrawableTriangle", [this.x1, this.y1, this.x2, this.y2, this.x3, this.y3, this.color]);
  }

  getCorners() {
    return [
      {
        x: this.x1,
        y: this.y1,
      },
      {
        x: this.x2,
        y: this.y2,
      },
      {
        x: this.x3,
        y: this.y3,
      },
    ];
  }

  pointIsWithin(pointX, pointY) {
    return MathUtils.ptInTriangle({ x: pointX, y: pointY }, { x: this.x1, y: this.y1 }, { x: this.x2, y: this.y2 }, { x: this.x3, y: this.y3 });
  }
}

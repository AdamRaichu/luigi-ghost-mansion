import { MathUtils } from "./math.mjs";

function getAsJSON(type, args) {
  return {
    type,
    args,
  };
}

export class Drawable {
  static context;

  static setContext(ctx) {
    Drawable.context = ctx;
  }

  static fromJSON(jsonData) {
    switch (jsonData.type) {
      case "DrawableWall":
        return new DrawableWall(...jsonData.args);
        break;

      case "DrawableImage":
        return new DrawableImage(...jsonData.args);

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
}

export class DrawableImage extends Drawable {
  x;
  y;
  rot;
  imgName;

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
    return {
      topRight: MathUtils.findPointFromRotation(this.x, this.y, this.rot - 45, Math.sqrt((image.naturalWidth / 2) ** 2 + (image.naturalHeight / 2) ** 2)),
      bottomRight: MathUtils.findPointFromRotation(this.x, this.y, this.rot + 45, Math.sqrt((image.naturalWidth / 2) ** 2 + (image.naturalHeight / 2) ** 2)),
      bottomLeft: MathUtils.findPointFromRotation(this.x, this.y, this.rot + 135, Math.sqrt((image.naturalWidth / 2) ** 2 + (image.naturalHeight / 2) ** 2)),
      topLeft: MathUtils.findPointFromRotation(this.x, this.y, this.rot - 135, Math.sqrt((image.naturalWidth / 2) ** 2 + (image.naturalHeight / 2) ** 2)),
    };
  }

  pointIsWithin(pointX, pointY) {
    const corners = this.getCorners();
    const isInUpperLeftHalf = MathUtils.ptInTriangle({ x: pointX, y: pointY }, corners.bottomLeft, corners.topRight, corners.topLeft);
    const isInLowerRightHalf = MathUtils.ptInTriangle({ x: pointX, y: pointY }, corners.bottomLeft, corners.topRight, corners.bottomRight);

    // new DrawableWall(corners.bottomLeft.x, corners.bottomLeft.y, 10, 10, "#4e019d").draw();
    // new DrawableWall(corners.topRight.x, corners.topRight.y, 10, 10, "#019a9d").draw();
    // new DrawableWall(corners.topLeft.x, corners.topLeft.y, 10, 10, "#0bcf2f").draw();
    // new DrawableWall(corners.bottomRight.x, corners.bottomRight.y, 10, 10, "#0c12cd").draw();
    return isInUpperLeftHalf || isInLowerRightHalf;
  }
}

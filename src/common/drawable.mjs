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
}

export class DrawableWall extends Drawable {
  static wallColor = "#412b0a";
  x;
  y;
  w;
  h;

  constructor(x, y, w, h) {
    super(function (ctx) {
      ctx.fillStyle = DrawableWall.wallColor;
      ctx.fillRect(x, y, w, h);
    });
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  toJSON() {
    return getAsJSON("DrawableWall", [this.x, this.y, this.w, this.h]);
  }
}

export class DrawableImage extends Drawable {
  x;
  y;
  rot;
  imgName;

  constructor(imageName, xPos, yPos, rotation) {
    super(function (ctx) {
      const image = DrawableImage.getOrCreateImage(imageName, rotation);
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

  static getOrCreateImage(name, rot) {
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

    returnImage.style.rotate = rot;
    return returnImage;
  }

  toJSON() {
    return getAsJSON("DrawableImage", [this.imgName, this.x, this.y, this.rot]);
  }
}

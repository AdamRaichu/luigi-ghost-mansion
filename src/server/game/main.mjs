import { randomUUID } from "crypto";
import { DrawableImage } from "../../common/drawable.mjs";
import { GameMaps } from "./maps.mjs";

export class ServerGame {
  static currentGame = new ServerGame();

  static getCurrent() {
    return ServerGame.currentGame;
  }

  constructor() {
    console.log("new ServerGame");
  }

  playerRoles = {};

  map = GameMaps.randomMap();

  begin() {}

  newPlayer() {
    const id = randomUUID();
    const playerCount = this.getPlayerCount();

    if (playerCount === 0) {
      this.playerRoles[id] = "role1";
    } else if (playerCount === 1) {
      this.playerRoles[id] = "role2";
    } else {
      this.playerRoles[id] = "spectator";
    }

    return id;
  }

  getPlayerRole(id) {
    return this.playerRoles[id];
  }

  getPlayerCount() {
    return Object.keys(this.playerRoles).length;
  }

  getUpdateData(id) {
    const returnData = {};
    const role = this.getPlayerRole(id);
    returnData.playerCount = this.getPlayerCount();
    returnData.renderData = this.map.getRenderData();

    var shouldRenderGhost = false;

    switch (role) {
      case "role1":
        shouldRenderGhost = true;
        break;

      case "role2":
        break;

      case "spectator":
        break;

      default:
        break;
    }

    if (shouldRenderGhost) {
      returnData.renderData.push(new DrawableImage("ghost.jpg", 50, 50, new Date().getSeconds() * 6));
    }

    return returnData;
  }
}

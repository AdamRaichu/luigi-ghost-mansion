import { randomUUID } from "crypto";
import { DefaultConfig } from "../../common/default-config.mjs";
import { Role } from "../../common/role.mjs";
import { GameMap } from "./maps.mjs";
import { Ghost } from "./player.mjs";

export class ServerGame {
  static currentGame = new ServerGame();

  static getCurrent() {
    return ServerGame.currentGame;
  }

  constructor() {
    console.log("new ServerGame");
  }

  playerRoles = {};
  /**
   * Structure:
   * ```
   *  {
   *    ID: {
   *      Action: key
   *    }
   *  }
   * ```
   */
  playerConfig = {};
  pressedKeys = {};

  map = GameMap.randomMap();

  newPlayer() {
    const id = randomUUID();
    const playerCount = this.getPlayerCount();

    if (playerCount === 0) {
      this.playerRoles[id] = Role.ghost;
    } else if (playerCount === 1) {
      this.playerRoles[id] = Role.luigi1;
    } else {
      this.playerRoles[id] = Role.spectator;
    }

    this.playerConfig[id] = JSON.parse(JSON.stringify(DefaultConfig));

    return id;
  }

  updateConfig(id, config) {
    this.playerConfig[id] = { ...this.playerConfig[id], ...config };
  }

  getPlayerRole(id) {
    return this.playerRoles[id];
  }

  getGhostPlayer() {
    console.assert(this.getPlayerCount() > 0, "Cannot get ghost if no players are registered.");

    const _this = this;
    var ghostId = "NONE";
    Object.keys(this.playerRoles).forEach(function (id) {
      if (_this.getPlayerRole(id) === Role.ghost) {
        ghostId = id;
      }
    });
    console.assert(ghostId !== "NONE", "No player ids match ghost role (using getPlayerRole).");

    return new Ghost(ghostId);
  }

  getPlayerCount() {
    return Object.keys(this.playerRoles).length;
  }

  getUpdateData(input) {
    const returnData = {};

    // Track which keys the player is pressing.
    this.pressedKeys[input.id] = input.pressedKeys;

    // Update the player counter.
    returnData.playerCount = this.getPlayerCount();

    // Add renderData from the map.
    returnData.renderData = this.map.getRenderData();

    // Add to renderData based on role.
    const role = this.getPlayerRole(input.id);
    const ghost = this.getGhostPlayer();
    if (role === Role.ghost || ghost.isSprinting()) {
      this.renderGhost(returnData.renderData);
    }

    return returnData;
  }

  /**
   * Add the render data for the ghost to `renderData`.
   * @param {Drawable[]} renderData
   */
  renderGhost(renderData) {}
}

import { randomUUID } from "crypto";
import { DefaultConfig } from "../../common/default-config.mjs";
import { DrawableImage } from "../../common/drawable.mjs";
import { Messages } from "../../common/messages.mjs";
import { Role } from "../../common/role.mjs";
import { GameMap } from "./maps.mjs";
import { Ghost } from "./player.mjs";
import { PositionTracker } from "./position.mjs";

export class ServerGame {
  static currentGame = new ServerGame();

  static getCurrent() {
    return ServerGame.currentGame;
  }

  constructor() {
    console.log("new ServerGame");
    this._preGameLoop = setInterval(function () {
      ServerGame.getCurrent().preGameLoop();
    }, 1000);
  }

  playerRoles = {};
  playerReady = {};
  playerLastUpdate = {};
  playerSockets = {};
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

  _preGameLoop;

  preGameLoop() {
    // Make sure enough players are here to have an actual game.
    if (!(this.getPlayerCount() >= 2)) {
      return;
    }

    // Check if all players are ready.
    var areAllReady = true;
    const _this = this;
    Object.keys(this.playerReady).forEach(function (id) {
      areAllReady = areAllReady && _this.playerReady[id];
    });
    if (!areAllReady) {
      return;
    }

    // Start the game!
    this.begin();
  }

  gameLoop() {
    // Check if any players have been inactive for too long.
  }

  begin() {
    console.log("Game started!");
    clearInterval(this._preGameLoop);

    // Notify all clients that the game has begun.
    const _this = this;
    Object.keys(this.playerSockets).forEach(function (id) {
      _this.playerSockets[id].send(JSON.stringify({ type: Messages.gameStart }));
    });
  }

  newPlayer(socket) {
    const id = randomUUID();
    const playerCount = this.getPlayerCount();

    this.playerReady[id] = false;
    this.playerSockets[id] = socket;
    this.playerLastUpdate[id] = Date.now();

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

    // Track the time the player last communicated with the server.
    this.playerLastUpdate[input.id] = Date.now();

    // Track which keys the player is pressing.
    this.pressedKeys[input.id] = input.pressedKeys;

    // Update the player counter.
    returnData.playerCount = this.getPlayerCount();

    // Add renderData from the map.
    returnData.renderData = this.map.getRenderData();

    // Add to renderData based on role.
    const role = this.getPlayerRole(input.id);
    const ghost = this.getGhostPlayer();
    const isGhost = role === Role.ghost;
    const shouldPlayersSeeGhost = ghost.isSprinting();

    if (isGhost || shouldPlayersSeeGhost) {
      this.renderGhost(returnData.renderData);
    }

    if (isGhost && !shouldPlayersSeeGhost) {
      // TODO: Render the awareness overlay.
    }

    this.renderPlayers(returnData.renderData);

    return returnData;
  }

  /**
   * Add the render data for the ghost to `renderData`.
   * @param {Drawable[]} renderData
   */
  renderGhost(renderData) {
    const ghost = this.getGhostPlayer();
    const posData = this.map.positions[Role.ghost];
    renderData.push(new DrawableImage("ghost.jpg", posData.x, posData.y));
  }

  renderPlayers(renderData) {
    for (const id in this.playerRoles) {
      const role = this.playerRoles[id];
      if (role === Role.ghost || role === Role.spectator) {
        continue;
      }

      /**
       * @type {PositionTracker}
       */
      const posData = this.map.positions[role];
      renderData.push(new DrawableImage("luigi.png", posData.x, posData.y));
    }
  }
}

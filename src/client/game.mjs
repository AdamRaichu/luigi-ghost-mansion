import { Drawable } from "../common/drawable.mjs";
import { Messages } from "../common/messages.mjs";
import { CanvasUtils } from "./canvas.mjs";

const statusDisplay = document.getElementById("status");
const playerCountDisplay = document.getElementById("playerCount");
const roleDisplay = document.getElementById("role");
const updateInterval = 100;

// Needed to get the websocket host.
const params = Object.fromEntries(new URLSearchParams(location.search));

// Setup the canvas
const canvas = document.getElementById("canvas");
const cu = new CanvasUtils(canvas);
Drawable.setContext(cu.ctx);

// Track pressed keys
var keyMap = {};
window.addEventListener("keydown", function (ev) {
  keyMap[ev.key] = true;
});
window.addEventListener("keyup", function (ev) {
  keyMap[ev.key] = false;
});

getAndRefreshSocket();

class ClientGame {
  /**
   * @type {WebSocket}
   */
  socket;
  status;
  id;
  lastUpdateTime;

  constructor() {
    this.setStatus(GameStatus.CONNECTING);
    this.id = null;
    const _this = this;
    setInterval(function () {
      _this.requestUpdateFromServer();
    }, updateInterval);
  }

  /**
   *
   * @param {WebSocket} s
   */
  setSocket(s) {
    this.socket = s;
    s.addEventListener("message", this.socketListener);
    this.requestUpdateFromServer();
  }

  /**
   *
   * @param {MessageEvent} ev
   */
  socketListener(ev) {
    var data = JSON.parse(ev.data);
    if (params?.debug) {
      console.log(data);
    }
    switch (data.type) {
      case Messages.idFulfill:
        game.id = data.id;
        console.log("Your new role is " + data.role);
        console.log("Private id is " + data.id);
        roleDisplay.innerText = data.role;
        statusDisplay.innerText = GameStatus.WAITING_PLAYER;
        game.requestUpdateFromServer();
        break;

      case Messages.updateFulfill:
        if (data.time < this.lastUpdateTime) {
          console.log("Received outdated data.");
          return;
        }
        const response = data.data;
        playerCountDisplay.innerText = response.playerCount;

        // Rendering
        cu.clear();
        for (const jsonData of response.renderData) {
          Drawable.fromJSON(jsonData).draw();
        }
        break;
      default:
        console.warn("Unknown response from server.");
        break;
    }
  }

  setStatus(s) {
    this.status = s;
    statusDisplay.innerText = s;
  }

  requestUpdateFromServer() {
    if (this.id === null) {
      this.requestIdFromServer();
    } else {
      this.sendMessageToServer({ type: Messages.updateRequest, id: this.id, pressedKeys: keyMap });
    }
  }

  /**
   *
   * @param {Object} o
   */
  sendMessageToServer(o) {
    this.socket.send(JSON.stringify(o));
  }

  requestIdFromServer() {
    this.sendMessageToServer({ type: Messages.idRequest });
  }
}

const GameStatus = {
  CONNECTING: "Connecting to server...",
  WAITING_SERVER: "Waiting for information from the server...",
  IN_PROGRESS: "Game is in progress.",
  DISCONNECTED: "Disconnected! Attempting to reconnect.... Please DO NOT reload! You will lose your unique ID.",
  SPECTATOR: "You are a spectator.",
  WAITING_PLAYER: "Waiting for more players....",
};

/**
 *
 * @returns {Promise<WebSocket>}
 */
async function getSocket() {
  return new Promise(async function (resolve, reject) {
    var hasValidConnection = false;
    while (!hasValidConnection) {
      const socket = new WebSocket(`ws://${decodeURIComponent(params.socket_host)}`);

      socket.addEventListener("open", (event) => {
        hasValidConnection = true;
        console.log("open");
        resolve(socket);
      });

      socket.addEventListener("error", (event) => {
        console.log("Connection error");
      });

      await new Promise((r) => setTimeout(r, 2000));
    }
  });
}

function getAndRefreshSocket() {
  getSocket().then(function (s) {
    console.log("Valid socket was found.");
    game.setSocket(s);
    game.setStatus(GameStatus.WAITING_SERVER);
    s.addEventListener("close", function () {
      console.log("WebSocket has closed!");
      game.setStatus(GameStatus.DISCONNECTED);
      getAndRefreshSocket();
    });
  });
}

const game = new ClientGame();

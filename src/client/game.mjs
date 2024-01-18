import { DefaultConfig } from "../common/default-config.mjs";
import { Drawable } from "../common/drawable.mjs";
import { Messages } from "../common/messages.mjs";
import { CanvasUtils } from "./canvas.mjs";
import { getCurrentConfig } from "./config.mjs";
import { showNotification } from "./notif.mjs";

// TODO: Change update interval based on player readiness.

const statusDisplay = document.getElementById("status");
const playerCountDisplay = document.getElementById("playerCount");
var lastPlayerCount = 0;
const roleDisplay = document.getElementById("role");
const updateInterval = 100;
/**
 * @type {HTMLAudioElement}
 */
const stage1 = document.getElementById("stage1");
const readyButton = document.getElementById("ready");

// Needed to get the websocket host.
const params = Object.fromEntries(new URLSearchParams(location.search));

// Setup the canvas
const canvas = document.getElementById("canvas");
const cu = new CanvasUtils(canvas);
Drawable.setContext(cu.ctx);

// Track pressed keys
// Use toLowerCase here because caps lock and shift change the key.
var keyMap = {};
window.addEventListener("keydown", function (ev) {
  keyMap[ev.key.toLowerCase()] = true;
});
window.addEventListener("keyup", function (ev) {
  keyMap[ev.key.toLowerCase()] = false;
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
    if (Object.keys(params).includes("debug")) {
      console.log(data);
    }
    switch (data.type) {
      case Messages.idFulfill:
        game.id = data.id;
        console.log("Your new role is " + data.role);
        console.log("Private id is " + data.id);
        roleDisplay.innerText = data.role;
        statusDisplay.innerText = GameStatus.WAITING_PLAYER;
        const currentConfig = getCurrentConfig();
        if (!(currentConfig === DefaultConfig)) {
          game.sendConfigUpdateToServer(currentConfig);
        }
        game.requestUpdateFromServer();
        break;

      case Messages.updateFulfill:
        if (data.time < this.lastUpdateTime) {
          console.log("Received outdated data.");
          return;
        }
        const response = data.data;

        // Update playerCountDisplay
        if (lastPlayerCount !== response.playerCount) {
          playerCountDisplay.innerText = response.playerCount;
        }

        // Rendering
        cu.clear();
        for (const jsonData of response.renderData) {
          Drawable.fromJSON(jsonData).draw();
        }
        break;

      case Messages.setConfigAck:
        showNotification("The server received your config update.");
        break;

      case Messages.playerReadyAck:
        showNotification("The server received your ready signal.");
        break;

      case Messages.gameStart:
        game.setStatus(GameStatus.IN_PROGRESS);
        stage1.play();
        break;

      case Messages.errorResponse:
        console.error(data.message, data);
        if (data.message === "Received message with unknown id. Please reload the page.") {
          showNotification("Your game id is unknown to the server. Likely, the server restarted. The page will reload in 5 seconds.");
          setTimeout(function () {
            location.reload();
          }, 5000);
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

  sendConfigUpdateToServer(config, silent = false) {
    this.sendMessageToServer({ type: Messages.setConfig, id: this.id, config, silent });
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
  return new Promise(async function (resolve, _reject) {
    var hasValidConnection = false;
    while (!hasValidConnection) {
      const useSecureSocket = Object.keys(params).includes("secure_socket");
      const socket = new WebSocket(`${useSecureSocket ? "wss" : "ws"}://${decodeURIComponent(params.socket_host)}`);
      // const socket = new WebSocket(`wss://${decodeURIComponent(params.socket_host)}`);

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

async function getAndRefreshSocket() {
  getSocket().then(function (socket) {
    console.log("Valid socket was found.");
    game.setSocket(socket);
    game.setStatus(GameStatus.WAITING_SERVER);
    socket.addEventListener("close", function () {
      console.log("WebSocket has closed!");
      game.setStatus(GameStatus.DISCONNECTED);
      getAndRefreshSocket();
    });
  });
}

export const game = new ClientGame();

readyButton.addEventListener("click", function () {
  readyButton.disabled = true;
  readyButton.textContent = "Ready.";
  game.sendMessageToServer({ type: Messages.playerReady, id: game.id });
});

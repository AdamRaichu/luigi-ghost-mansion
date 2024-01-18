import { WebSocketServer } from "ws";
import { Messages } from "../common/messages.mjs";
import { ServerGame } from "./game/main.mjs";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("Received new connection");
  ws.on("message", function message(_data) {
    console.log("received: %s", _data);
    var data;
    try {
      data = JSON.parse(_data);
    } catch (error) {
      sendTo(ws, { type: Messages.errorResponse, message: "Invalid JSON" });
      return;
    }
    console.log("Received " + data.type + " from " + data.id);
    const game = ServerGame.getCurrent();
    switch (data.type) {
      case Messages.idRequest:
        const newId = game.newPlayer(ws);
        const role = game.getPlayerRole(newId);
        sendTo(ws, { type: Messages.idFulfill, id: newId, role });
        break;

      case Messages.updateRequest:
        if (!Object.keys(game.playerRoles).includes(data.id)) {
          sendTo(ws, { type: Messages.errorResponse, message: "Received message with unknown id. Please reload the page." });
          return;
        }
        sendTo(ws, { type: Messages.updateFulfill, data: game.getUpdateData(data) });
        break;

      case Messages.setConfig:
        game.updateConfig(data.id, data.config);
        if (!data.silent) {
          sendTo(ws, { type: Messages.setConfigAck });
        }
        break;

      case Messages.playerReady:
        game.playerReady[data.id] = true;
        sendTo(ws, { type: Messages.playerReadyAck });
        break;

      default:
        sendTo(ws, { type: Messages.errorResponse, msg: "Unknown message received from client. (Does not match any expected members of Messages.)", data });
        break;
    }
  });
});

/**
 *
 * @param {WebSocket} ws
 * @param {Object} data
 */
function sendTo(ws, data) {
  data.time = Date.now();
  ws.send(JSON.stringify(data));
  console.log(`sent ${data.type} with ${data?.data?.renderData.length} Drawable elements.`);
}

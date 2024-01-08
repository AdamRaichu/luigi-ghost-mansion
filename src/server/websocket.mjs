import { WebSocketServer } from "ws";
import { Messages } from "../common/messages.mjs";
import { ServerGame } from "./game/main.mjs";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("Received new connection");
  ws.on("message", function message(_data) {
    console.log("received: %s", _data);
    const data = JSON.parse(_data);
    console.log("Received " + data.type + " from " + data.id);
    const game = ServerGame.getCurrent();
    switch (data.type) {
      case Messages.idRequest:
        const newId = game.newPlayer();
        const role = game.getPlayerRole(newId);
        sendTo(ws, { type: Messages.idFulfill, id: newId, role });
        break;

      case Messages.updateRequest:
        sendTo(ws, { type: Messages.updateFulfill, data: game.getUpdateData(data) });
        break;

      default:
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

import fs from "node:fs";
import util from "node:util";

// Overwrite console.log
const currentDate = new Date();

// Make sure the logs folder exists
if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

const logFilePath = `./logs/${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}--${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}.log`;
fs.writeFileSync(logFilePath, "--- Beginning of log ---\n");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

console.log = function () {
  // logStream.write(util.format.apply(null, arguments) + "\n");
};
console.error = console.log;

import * as WebSocket from "./websocket.mjs";
import * as Static from "./static.mjs";

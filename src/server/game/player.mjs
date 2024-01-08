import { ServerGame } from "./main.mjs";

class Player {
  id;
  config;

  constructor(id) {
    this.id = id;
    this.config = ServerGame.getCurrent().playerConfig[id];
  }

  isPressing(key) {
    return ServerGame.getCurrent().pressedKeys[this.id][key];
  }
}

export class Ghost extends Player {
  constructor(id) {
    super(id);
  }

  isSprinting() {
    return this.isPressing(this.config.GhostSprint);
  }
}

export class Luigi extends Player {
  constructor(id) {
    super(id);
  }
}

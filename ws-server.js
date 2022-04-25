const socket = require("ws");

const server = {
  run: function (host, port) {
    port = port || "9000";
    host = host || "localhost";
    console.log(`Сервер запущен на ${host}:${port} порту`);
    return new socket.Server({ host: host, port: port.toString() });
  },
};

const clients = {
  storage: new Map(),
  count: function () {
    return this.storage.size;
  },
  create: function (ws) {
    this.storage.set(ws, { id: this._uuidv4() });
    console.log(this.count())
  },
  drop: function (ws) {
    this.storage.delete(ws);
  },
  metadata: function (ws) {
    return this.storage.get(ws);
  },
  broadcast: function (msg) {
    [...this.storage.keys()].forEach((client) => {
      client.send(JSON.stringify(msg));
    });
  },
  _uuidv4: function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (char) {
        const rand = (Math.random() * 16) | 0;
        return (char == "x" ? rand : (rand & 0x3) | 0x8).toString(16);
      }
    );
  },
};

const actions = function (msg, ws) {
  switch (msg.action) {
    case "kill":
      ws.send("droped");
      break;

    default:
      msg.sender = clients.metadata(ws).id;
      clients.broadcast(msg);
      break;
  }
};

const wss = server.run("localhost", 9000);
wss.on("connection", (ws) => {
  clients.create(ws);
  ws.send(`Привет ${clients.count()}`);

  ws.on("message", (message) => {
   const json = JSON.parse(message)
   console.log(json)
    actions(json, ws);
  });

  ws.on("close", () => {
    clients.drop(ws);
    console.log("Пользователь отключился");
  });
});

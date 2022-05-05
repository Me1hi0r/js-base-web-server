const socket = require("ws");

const players = {
  storage: {},
  count() {
    return Object.keys(this.storage).length;
  },
  add(ws) {
    const rand_id = this._uuidv4();
    this.storage[rand_id] = ws;
    return rand_id;
  },
  drop(id) {
    delete this.storage[id];
  },
  get_socket(id) {
    return this.storage[id];
  },
  get_id(ws) {
    let id;
    Object.entries(this.storage).forEach((client) => {
      if (client[1] === ws) {
        id = client[0];
      }
    });
    return id;
  },
  send_all(msg) {
    console.log(msg);
    Object.values(this.storage).forEach((ws) => ws.send(JSON.stringify(msg)));
  },
  all_update() {
    this.send_all({ action: "map-update", data: map });
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

const server = {
  run: function (host, port) {
    port = port || "9000";
    host = host || "localhost";
    console.log(`Сервер запущен на ${host}:${port} порту`);
    return new socket.Server({ host: host, port: port.toString() });
  },
};

const room = {
  storage: new Set(),
  count: function () {
    return this.storage.length;
  },
  create: function (name) {
    this.storage.add(name);
  },
  list: function () {
    return Array.from(this.storage);
  },
};

const map = {
  size: {
    x: 10,
    y: 10,
    s: 16,
  },
  wall: [
    [9, 0],
    [3, 5],
    [3, 9],
    [3, 2],
    [5, 8],
  ],
  berry: [
    [2, 4],
    [8, 2],
    [7, 3],
  ],
  snakes: {},
  add_snake(id) {
    const point = this.rand_cord()
    this.snakes[id] = {
      id: id,
      head: { x: point.x, y: point.y },
      tail: [
        [point.x, point.y--],
        [point.x, point.y--],
      ],
    };
  },

  check_collision(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  },

  rand(val) {
    return this.getRandomInt(0, val) * this.size.s;
  },
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },
  rand_cord() {
    let x = this.rand(this.size.x);
    let y = this.rand(this.size.y);

    for (let e of this.berry)
      if (this.check_collision(e, { x, y })) return this.rand_cord();

    for (let e of this.wall)
      if (this.check_collision(e, { x, y })) return this.rand_cord();
    
    return {x, y}
  },
};

const wss = server.run("localhost", 9000);

wss.on("connection", (ws) => {
  console.log('connection ')
  new_id = players.add(ws)
  map.add_snake(new_id)

  ws.on("message", (msg) => {
    const req = JSON.parse(msg);
    switch (req.action) {
      case "get-room": 
        ws.send(JSON.stringify({ action: req.action, data: room.list(), }));
        break;
      case "create-room": 
        room.create(req.data); 
        break;
      case "get-map": 
        ws.send(JSON.stringify({ action: req.action, data: map_gen(prop.b, prop.w, prop.l)}));
        break;
      case "move":
        map.snakes[req.data.id] = req.data
        players.all_update()
      case "start-game":
        ws.send(JSON.stringify({ action: "set-id", data: { id: players.get_id(ws) } }))
        players.all_update()
        break;

      default:
        break;
    }
  });

  ws.on("close", () => {
    players.drop(players.get_id(ws))
    console.log("Пользователь отключился");
  });
});

const send = function (socket, param) {
  socket.send(JSON.stringify(param));
};
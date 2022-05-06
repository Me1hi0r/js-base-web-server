const socket = require("ws");

const wss = new socket.Server({ host: "localhost", port: 9000 });
wss.on("connection", (ws) => {
  map.players.add(ws);
  map.players.broadcast();

  ws.on("message", (msg) => {
    const req = JSON.parse(msg);
    if (req.action === "create-room") room.create(req.data);
    if (req.action === "get-room")
      ws.send(
        JSON.stringify({
          action: "get-room",
          data: room.list(),
        })
      );
    if (req.action === "move") {
      console.log('move')
      map.senpentarium[req.data.id] = req.data;
      map.players.broadcast();
    }
  });

  ws.on("close", () => {
    map.players.drop(ws);
    console.log("Пользователь отключился");
  });
});

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
  senpentarium: {},
  add_snake(id) {
    const point = this.rand_cord();
    this.senpentarium[id] = {
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

    return { x, y };
  },
  players: {
    storage: {},
    count() {
      return Object.keys(this.storage).length;
    },
    add(ws) {
      const id = this._uuidv4();
      this.storage[id] = ws;
      map.add_snake(id);
      ws.send(JSON.stringify({ action: "set-id", data: { id } }));
    },
    drop(ws) {
      delete this.storage[this.get_id(ws)];
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
    broadcast() {
      this.send_all({ 
        action: "map-update", 
        data: { 
          size: map.size,
          berry: map.berry,
          wall: map.wall,
          snakes: map.senpentarium
      } });
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
  },
};

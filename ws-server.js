const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ host: "localhost", port: 9000 });

wss.on("connection", (ws) => {
  map.players.add(ws);
  map.players.broadcast();

  ws.on("message", (msg) => {
    const { action, data } = JSON.parse(msg);
    if (action === "move") map.players.update_brodcast(data);
  });

  ws.on("close", () => map.players.drop(ws));
});

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
    const point = this.random_empty_cord();
    // const {x, y} = this.random_empty_cord();
    // console.log(x,y )
    this.senpentarium[id] = {
      id: id,
      head: { x: point.x, y: point.y },
      tail: [
        [point.x, point.y--],
        [point.x, point.y--],
      ],
    };
  },
  random_empty_cord() {
    const new_pos = rand_map_cord(this.size) 
    for (let pos of this.berry) if (equal(pos, new_pos)) return this.rand_cord();
    for (let pos of this.wall) if (equal(pos, new_pos)) return this.rand_cord();
    return new_pos;

    function equal(obj1, obj2) {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    function rand_map_cord(size) {
      const rand = val => Math.floor(Math.random() * val)
      return {x: rand(size.x) * size.s, y: rand(size.y) * size.s} 
    }
  },
  players: {
    storage: {},
    count() {
      return Object.keys(this.storage).length;
    },
    add(ws) {
      const id = uuidv4();
      this.storage[id] = ws;
      map.add_snake(id);
      ws.send(JSON.stringify({ action: "socket-id", data: { id } }));
      console.log(`Add user: ${id}`);

      function uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (char) {
            const rand = (Math.random() * 16) | 0;
            return (char == "x" ? rand : (rand & 0x3) | 0x8).toString(16);
          }
        );
      }
    },
    drop(ws) {
      const id = this.get_id(ws);
      delete this.storage[id];
      console.log(`Drop user: ${id}`);
    },
    get_socket(id) {
      return this.storage[id];
    },
    get_id(ws) {
      Object.entries(this.storage).forEach((client) => {
        if (client[1] === ws) return client[0];
      });
    },

    update_brodcast(data) {
      map.senpentarium[data.id] = data;
      this.broadcast();
    },
    broadcast() {
      send_all({
        action: "update",
        data: {
          size: map.size,
          berry: map.berry,
          wall: map.wall,
          snakes: map.senpentarium,
        },
      });

      function send_all(msg){
        wss.clients.forEach(ws=>ws.send(JSON.stringify(msg)))
      }
    },
  },
};

const fs = require("ws");
const WebSocketServer = require("ws").Server;
const WebSocket = require("ws").WebSocket;
const wss = new WebSocketServer({ host: "localhost", port: 9000 });

const text = `@@@@@@@@@@@@
@bbbb      @
@          @
@          @
@          @
@          @
@          @
@          @
@          @
@          @
@          @
@@@@@@@@@@@@
`;

const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (char) {
      const rand = (Math.random() * 16) | 0;
      return (char == "x" ? rand : (rand & 0x3) | 0x8).toString(16);
    }
  );
};

const game = {
  players: {
    storage: {},
    count() {
      return Object.keys(this.storage).length;
    },

    add(ws, id) {
      this.storage[id] = ws;
      game.map.add_snake(id);
      ws.send(JSON.stringify({ action: "socket-id", data: { id } }));
      console.log(`Add user: ${id}`);
    },
    drop(name) {
      Object.entries(this.storage).forEach(([id, ws]) => {
        if (ws === name) {
          delete this.storage[id];
          game.map.drop_snake(id)
          console.log(`Drop user: ${id}`);
          game.players.send(game.map.update_data());
        }
      });
    },

    send(obj) {
      wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
      });
    },
  },
  map: {
    prop: {
      px: 16,
      x: 12,
      y: 12,
      berry: 10,
    },
    object: [
      [{ type: "w", color: "#112233" }, []],
      [{ type: "b", color: "#00FF2F" }, []],
    ],
    empty: new Set(),

    add_empty(cord) {
      const [x, y] = cord;
      const val = y * this.prop.y + x + 1;
      val;

      this.empty.add(val);
    },
    pop_rnd_empty() {
      const rnd_index = Math.floor(Math.random() * this.empty.size);
      const rnd_elem = Array.from(this.empty.values())[rnd_index];
      const cord = [
        (rnd_elem % this.prop.x) - 1,
        Math.ceil(rnd_elem / this.prop.y) - 1,
      ];

      this.empty.delete(rnd_elem);
      return cord;
    },
    init(prop) {
      this.prop = prop;
    },
    parse(text) {
      for (const [y, line] of text.split("\n").entries()) {
        for (const [x, type] of Array.from(line).entries()) {
          const cord = [x, y];
          if (type === "@") this.object[0][1].push(cord);
          if (type === "b") this.object[1][1].push(cord);
          if (type === " ") this.add_empty(cord);
        }
      }
      return this;
    },
    add_snake(id) {
      this.object.push([
        { type: "s", color: "blue", id: id, length: 5 },
        [this.pop_rnd_empty()],
      ]);
    },
    drop_snake(id) {
      let cnt = 0;
      this.object.forEach(([prop, data]) => {
        if (prop.type === "s" && prop.id === id) {
          console.log('before delete')
          game.map.add_empty(...data)
          this.object = this.object.filter((elem, ind)=> ind != cnt)
          return;
        }
        cnt++;
      });
    },
    add_rand_berry() {
      const [_, berry] = this.object[1];
      while (this.prop.berry > berry.length) {
        berry.push(this.pop_rnd_empty());
      }
      return this;
    },
    update_data() {
      return { action: "update", data: [this.prop, this.object] };
    },

    get_snake(id) {
      this.object.forEach(([prop, snake]) => {
        if (prop.type === "s") {
          if (prop.id === id) {
            return snake;
          }
        }
      });
    },
    update_snake(id, dir) {
      const update_cord = (dir, [x, y] = cord) => {
        if (dir === "ArrowRight") x = x >= this.prop.x - 1 ? 0 : ++x;
        if (dir === "ArrowDown") y = y >= this.prop.y - 1 ? 0 : ++y;
        if (dir === "ArrowLeft") x = x <= 0 ? this.prop.x - 1 : --x;
        if (dir === "ArrowUp") y = y <= 0 ? this.prop.y - 1 : --y;
        return [x, y];
      };
      this.object.forEach(([prop, snake]) => {
        if (prop.type === "s") {
          if (prop.id === id) {
            const head = snake[0];
            snake.unshift(update_cord(dir, head));
            if (snake.length > prop.length) game.map.add_empty(snake.pop());
            return snake;
          }
        }
      });
    },
  },
};

async function getFile(path) {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const text = Buffer.from(data).toString();
      resolve(text);
    });
  });
  return await promise;
}

game.map.parse(text).add_rand_berry();
wss.on("connection", (ws) => {
  game.players.add(ws, uuidv4());
  game.players.send(game.map.update_data());

  ws.on("message", (msg) => {
    const { action, ...data } = JSON.parse(msg);
    if (action === "move") {
      game.map.update_snake(data.id, data.dir);
      game.players.send(game.map.update_data());
    }
  });

  ws.on("close", () => game.players.drop(ws));
});

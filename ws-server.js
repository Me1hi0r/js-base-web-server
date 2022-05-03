const socket = require("ws");

const clients = {
  storage: new Map(),
  count: function () {
    return this.storage.size;
  },
  create: function (ws) {
    this.storage.set(ws, { id: this._uuidv4() });
    console.log(this.count());
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
    this.storage.add(name)
  },
  list: function(){
    return Array.from(this.storage) 
  }
}

const MAP = {
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
  snake: [
    {
      head: { x: 7, y: 8 },
      tail: [
        [7, 9],
        [8, 9],
      ],
    },
    // {
    //   head: { x: 4, y: 5 },
    //   tail: [
    //     [4, 6],
    //     [4, 7],
    //     [4, 8],
    //   ],
    // },
  ],
}


const prop = {
  b: 20,
  w: 10,
  l: 100
}

function map_gen(b, w, l)  {
  let arr = ['b', 'w', 'n']
  function random() {
    return Math.floor(Math.random() * arr.length) 
  }
  function init() {
    let cw = 0
    let cb = 0 
    let res = []
    for (let i = 0; i < l; i++) {
      let rand = random()
      if (arr[rand] == arr[0] && cb < b) {
        res.push(arr[rand])
        cb++
        continue
      }
      if (arr[rand] == arr[1] && cw < w) {
        res.push(arr[rand])
        cw++
        continue
      }
      res.push(arr[rand])
    }
    return res
  }
  let arrr = init()
  return arrr
}



const wss = server.run("localhost", 9000);
wss.on("connection", (ws) => {
  clients.create(ws);
  ws.on("message", (msg) => {
    const req = JSON.parse(msg);
    console.log(req)
    switch (req.action) {
      case "get-room":
        send(ws, {
          action: req.action, 
          data: room.list() 
        })
        break;
      case 'create-room': {
        room.create(req.data)
        break;
      }
      case 'get-map' : {
        send(ws, {
          action: req.action,
          data: map_gen(prop.b, prop.w, prop.l)
        })
        break;
      }
      case 'move':
        MAP.snake = [req.data]
        console.warn(MAP.snake)

        clients.broadcast({action: 'map-update', data: MAP})
        break;

      default:
        break;
    }
  });

  ws.on("close", () => {
    clients.drop(ws);
    console.log("Пользователь отключился");
  });
});


const send = function (socket, param) {
  socket.send(JSON.stringify(param));
};

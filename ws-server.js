const socket = require("ws");

const clients = {
  storage: new Map(),
  count: function () {
    return this.storage.size;
  },
  create: function (ws, id) {
    this.storage.set(ws, { id });
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
  snake: [
  ],
  add_snake(id, point){
    this.snake.push(
    {
      id: id,
      head: { x: point.x, y: point.y },
      tail: [
        [point.x, point.y--],
        [point.x, point.y--],
      ],
    },
    )
  },

  check_collision(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  },

  rand (val) {
    return this.getRandomInt(0, val) * this.size;
  },
 getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
},
  rand_cord(){
    let x = this.rand(this.size.x);
    let y = this.rand(this.size.y);

    for (let e of this.berry)
      if (this.check_collision(e, { x, y })) return this.rand_cord();

    for (let e of this.wall)
      if (this.check_collision(e, { x, y })) return this.rand_cord();
  }
}
  
function rand_map(){
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



const wss = server.run("localhost", 9000);
wss.on("connection", (ws) => {
  console.log('connect')
  const id = clients._uuidv4()
  clients.create(ws, id);
  try {
    
  map.add_snake(id, map.rand_cord())

  console.log(map)
  } catch (error) {
    
  console.log(error)
  }

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
        map.snake = [req.data]
        console.warn(map.snake)

        clients.broadcast({action: 'map-update', data: map})
      case 'start-game':
        send(ws, {action: 'set-id', data:{id: clients.metadata(ws).id}})
        clients.broadcast({action: 'map-update', data: map})
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

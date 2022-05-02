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

// const actions = function (msg, ws) {
//   switch (msg.action) {
//     case "get-rooms":
//       ws.send(JSON.stringify({'action':'one'}))
//       break;

//     default:
//       msg.sender = clients.metadata(ws).id;
//       clients.broadcast(msg);
//       break;
//   }
// };

// const action = {
//   action: "",
//   data: "",
//   check(msg){
//     m = JSON.parse(msg)
//     this.action = m.action
//     this.data = m.data
//     this.switch(this.action)
//   },
//   switch(key){
//     switch(key){
//       case "get-room":
//         send(ws, {
//           'action': key,
//           'data': ['rrrr1', 'rrrr2']})
//     }

//   }

// }

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

  function random_map() {
    console.log("init");
    const canvas = by_id("game-canvas");
    canvas.width = prop.size.w * prop.size.s;
    canvas.height = prop.size.h * prop.size.s;

    for (let i = 0; i < prop.berry.length; i++) {
      this.berrys.push(this.rand_cord());
    }
    for (let i = 0; i < this.wall; i++) {
      this.walls.push(this.rand_cord());
    }
  }
  function rand_cord() {
    let x = rand(prop.size.w);
    let y = rand(prop.size.h);

    for (let b of prop.berry)
      if (check_collision(b, { x, y })) return rand_cord();

    for (let w of prop.wall)
      if (check_collision(w, { x, y })) return rand_cord();

    return { x, y };

    function rand(val) {
      return getRandomInt(0, val) * prop.size;
    }

    function check_collision(obj1, obj2) {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    }
  }
const rooms = ["room-one", "best-room"];

const prop = {
  size:{
    h: 10,
    w: 10
  },
  berry: 5,
  walls: 5,
  cell_size: 16
}

const  map_gen = (prop)=>{
  return {
    col: prop.size.w,
    row: prop.size.h,
    size: prop.cell_size,
    berry: prop.berry,
    wall: prop.walls,
    berrys: [],
    walls: [],

    check_collision(obj1, obj2){
        return JSON.stringify(obj1) === JSON.stringify(obj2)
    },
    rand_cord: function () {
        let x = this.rand(this.col)
        let y = this.rand(this.row)

        for (let e of this.berrys)
            if (this.check_collision(e, {x:x,y:y}))
                return this.rand_cord()

            
        for (let e of this.walls)
            if (this.check_collision(e, {x:x,y:y}))
                return this.rand_cord()
        
        return {x, y}
        },

    rand: function (val){
        return getRandomInt(0, val) * this.size
    },

    render: function () {
        console.log('render')
        for (let e of this.walls){
            console.log(e.x, e.y)
            paint(e.x, e.y, color.wall)
        }

        for (let e of this.berrys){
            paint(e.x, e.y, color.berry)
        }

    },
    init: function () {
        console.log('init')
        const canvas = by_id('game-canvas')
        canvas.width = this.col * this.size
        canvas.height = this.row * this.size
        for (let i = 0; i < this.berry; i++) {
            this.berrys.push(this.rand_cord())          
        }
        for (let i = 0; i < this.wall; i++) {
            this.walls.push(this.rand_cord())          
        }
    },
    reset: function () {
        this.berrys = []
        this.walls = []
        this.init()
        this.render()
    }
  }
}

const my_map = map_gen(prop)
my_map



const wss = server.run("localhost", 9000);
wss.on("connection", (ws) => {
  clients.create(ws);
  send(ws, { text: `Приветs ${clients.count()}` });

  ws.on("message", (msg) => {
    console.log("message recive");
    //  action(msg)
    const req = JSON.parse(msg);
    switch (req.action) {
      case "get-room":
        send(ws, {
          'action': req.action, 
          'data': room.list() 
        })
        break;
      case 'create-room': {
        room.create(req.data)
        break;
      }

      default:
        break;
    }
  });

  ws.on("close", () => {
    clients.drop(ws);
    console.log("Пользователь отключился");
  });
});

const cmd = {
  "get-room": () => console.log("get"),
  "create-room": () => 1,
  "enter-room": () => 2,
};

function action(msg) {
  const req = JSON.parse(msg);
  cmd[req.action]();
}

const send = function (socket, param) {
  socket.send(JSON.stringify(param));
};

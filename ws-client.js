let rooms;
let user_ws;

function room_element(name) {
  const wrap = document.createElement("div");
  wrap.classList.add("room-elem");
  wrap.classList.add("flex");

  const title = document.createElement("div");
  title.classList.add("room-elem-title");
  title.innerText = name;

  const enter = document.createElement("button");
  enter.innerText = `ENTER`;

  wrap.appendChild(title);
  wrap.appendChild(enter);
  enter.onclick = () => {
    send({ action: "get-map" });
    frame.nav.game.click();
  };
  let x = document.getElementById("name-room");
  x.value = "";
  return wrap;
}

const send = function (params) {
  ws.send(JSON.stringify(params));
};

const id = (name) => document.getElementById(name);
const cls = (name) => document.getElementsByClassName(name);

const frame = {
  start: id("start-screen"),
  room: id("room-screen"),
  user: id("user-screen"),
  game: id("game-screen"),
  screen: cls("screen"),
  nav: cls("nav-button"),
};

const close = () => Array.from(frame.screen).forEach((e) => (e.hidden = true));
const open = (name) => {
  close();
  name.hidden = false;
};

window.onload = () => {
  frame.nav.game.onclick = () => {
    open(frame.game);
    setTimeout(() => send({ action: "start-game" }), 1000);
  };
  frame.nav.room.onclick = () => {
    setTimeout(() => send({ action: "get-room" }), 1000);

    open(frame.room);
  };
  frame.nav.user.onclick = () => open(frame.user);
  frame.nav.start.onclick = () => open(frame.start);

  id("new-game").onclick = () => frame.nav.room.click();
  id("new-room").onclick = () => {
    const val = document.getElementById("name-room").value;
    send({
      action: "create-room",
      data: val,
    });
    id;
    setTimeout(() => send({ action: "get-room" }), 100);
  };
  frame.nav.game.click();
  // render(response);

  ws = new WebSocket("ws://localhost:9000");

  ws.onopen = function () {
    console.log("подключился");
  };

  ws.onerror = function (err) {
    console.log(err);
  };

  ws.onmessage = function (message) {
    try {
      const json = JSON.parse(message.data);
      switch (json.action) {
        case "get-room":
          const elem = document.getElementById("room-elem");
          elem.replaceChildren();
          rooms = json.data.forEach((name) =>
            elem.appendChild(room_element(name))
          );
          break;
        case "get-map":
          new_game();
        // console.log(json.data);
        case "map-update":
          // console.warn("data");
          // console.warn("resp");
          // console.warn(response);
          console.log('update')
          console.warn(json.data);
          // snake.update(snake);
          map.set(json.data);

          map.render();
          // render(json.data);
          break;

        case "set-id":
          console.warn('setid');
          snake.set_id(json.data.id);
          break;

        default:
          break;
      }
    } catch (error) {
      console.warn(message, error);
    }
  };
};

const snake = {
  id: '',
  x: 0,
  y: 0,
  len: 3,
  tail: [],

  set_id(id) {
    this.id = id;
  },

  update(head, tail) {
    this.x = head.x * map.size.s;
    this.y = head.y * map.size.s;
    this.tail = tail;
  },

  tail_update(x, y) {
    this.tail.unshift([x / map.size.s, y / map.size.s]);
    if (this.tail.length > this.len) {
      let drop = this.tail.pop();
      map.context.clearRect(drop.x, drop.y, map.size.s, map.size.s);
    }
  },

  position() {
    return {
      id: this.id,
      head: { x: this.x / map.size.s, y: this.y / map.size.s },
      tail: this.tail,
    };
  },

  left() {
    this.tail_update(this.x, this.y);
    this.x = this.x <= 0 ? map.size.s * (map.size.x - 1) : this.x - map.size.s;
    return this.position();
  },
  right() {
    this.tail_update(this.x, this.y);
    this.x = this.x >= map.size.s * (map.size.x - 1) ? 0 : this.x + map.size.s;
    return this.position();
  },
  down() {
    this.tail_update(this.x, this.y);
    this.y = this.y >= map.size.s * (map.size.y - 1) ? 0 : this.y + map.size.s;
    return this.position();
  },
  up() {
    this.tail_update(this.x, this.y);
    this.y = this.y <= 0 ? map.size.s * (map.size.y - 1) : this.y - map.size.s;
    return this.position();
  },
};

const map = {
  size: {},
  snake: [],
  berry: [],
  wall: [],
  context: null,
  color: {
    snake: "#FA0556",
    tail: "#A00034",
    empty: "#000000",
    wall: "#00FF00",
    berry: "#0000FF",
  },

  set(data) {
    (this.size = data.size),
      (this.snake = data.snake),
      (this.berry = data.berry),
      (this.wall = data.wall);
  },

  create_field() {
    const canvas = id("game-canvas");
    canvas.width = this.size.x * this.size.s;
    canvas.height = this.size.y * this.size.s;
    this.context = canvas.getContext("2d");
    return canvas.getContext("2d");
  },

  render() {
    console.log(this);
    const map = this.create_field();
    console.log("render");

    this.berry.forEach(([x, y]) => {
      paint(map, x, y, this.size.s, this.color.berry);
    });

    this.wall.forEach(([x, y]) => {
      paint(map, x, y, this.size.s, this.color.wall);
    });

    let first = true;
    this.snake.forEach(({ head, tail }) => {
      if (first) {
        snake.update(head, tail);
        first = false;
      }

      paint(map, head.x, head.y, this.size.s, this.color.snake);
      tail.forEach((t) => {
        paint(map, t[0], t[1], this.size.s, this.color.tail);
      });
    });

    function paint(map, x, y, s, color) {
      map.fillStyle = color;
      map.fillRect(x * s, y * s, s, s);
    }
  },
};

document.onkeydown = function (e) {
  const key = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  };
  console.log(e);
  switch (e.key) {
    case key.up:
      console.log("dd");
      send({
        action: "move",
        data: snake.up(),
      });
      break;
    case key.down:
      send({ action: "move", data: snake.down() });
      break;
    case key.left:
      send({ action: "move", data: snake.left() });
      break;
    case key.right:
      send({ action: "move", data: snake.right() });
      break;
    default:
      break;
  }
};

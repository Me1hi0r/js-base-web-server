const ws = new WebSocket("ws://localhost:9000");

let rooms;
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
        // console.warn(json.data);
        // console.warn("resp");
        // console.warn(response);
        render(json.data);
        break;

      default:
        break;
    }
  } catch (error) {
    console.warn(message, error);
  }
};

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
  frame.nav.game.onclick = () => open(frame.game);
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
  render(response);
};

let canvas = document.querySelector("#game-canvas");
let context = canvas.getContext("2d");

const response = {
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
    {
      head: { x: 4, y: 5 },
      tail: [
        [4, 6],
        [4, 7],
        [4, 8],
      ],
    },
  ],
};

prop = response;

const s = {
  x: 0,
  y: 0,
  len: 3,
  tail: [],

  update(head, tail) {
    this.x = head.x * prop.size.s;
    this.y = head.y * prop.size.s;
    this.tail = tail;
  },

  tail_update(x, y) {
    this.tail.unshift([x / prop.size.s, y / prop.size.s]);
    if (this.tail.length > this.len) {
      let drop = this.tail.pop();
      context.clearRect(drop.x, drop.y, prop.size.s, prop.size.s);
    }
  },

  position() {
    return {
      head: { x: this.x / prop.size.s, y: this.y / prop.size.s },
      tail: this.tail,
    };
  },

  left() {
    this.tail_update(this.x, this.y);
    this.x =
      this.x <= 0 ? prop.size.s * (prop.size.x - 1) : this.x - prop.size.s;
    return this.position();
  },
  right() {
    this.tail_update(this.x, this.y);
    this.x =
      this.x >= prop.size.s * (prop.size.x - 1) ? 0 : this.x + prop.size.s;
    return this.position();
  },
  down() {
    this.tail_update(this.x, this.y);
    this.y =
      this.y >= prop.size.s * (prop.size.y - 1) ? 0 : this.y + prop.size.s;
    return this.position();
  },
  up() {
    this.tail_update(this.x, this.y);
    this.y =
      this.y <= 0 ? prop.size.s * (prop.size.y - 1) : this.y - prop.size.s;
    return this.position();
  },
};

const render = function (prop) {
  const color = {
    snake: "#FA0556",
    tail: "#A00034",
    empty: "#000000",
    wall: "#00FF00",
    berry: "#0000FF",
  };

  console.log("render");
  const canvas = id("game-canvas");
  canvas.width = prop.size.x * prop.size.s;
  canvas.height = prop.size.y * prop.size.s;
  ["wall", "berry", "snake"].forEach((obj) => subrend(prop, obj));

  function subrend(prop, obj) {
    if (obj === "snake") {
      let first = true;
      for (let { head, tail } of prop.snake) {
        if (first) {
          s.update(head, tail);
          first = false;
        }

        paint(head.x * prop.size.s, head.y * prop.size.s, color.snake);
        tail.forEach((t) => {
          paint(t[0] * prop.size.s, t[1] * prop.size.s, color.tail);
        });
      }
    } else {
      for (let [x, y] of prop[obj]) {
        console.log(x, y);
        paint(x * prop.size.s, y * prop.size.s, color[obj]);
      }
    }

    function paint(x, y, color) {
      context.fillStyle = color;
      context.fillRect(x, y, prop.size.s, prop.size.s);
    }
  }
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
        data: s.up(),
      });
      break;
    case key.down:
      send({ action: "move", data: s.down() });
      break;
    case key.left:
      send({ action: "move", data: s.left() });
      break;
    case key.right:
      send({ action: "move", data: s.right() });
      break;
    default:
      break;
  }
};
const ws = new WebSocket("ws://localhost:9000");

let rooms;
ws.onopen = function () {
  console.log("подключился");
};

ws.onerror = function (err) {
  console.log(err);
};

ws.onmessage = function (message) {
  console.log(`msg: ${message.data}`);
  try {
    const json = JSON.parse(message.data);
    console.log("parse json");
    switch (json.action) {
      case "get-room":
        const elem = document.getElementById("room-elem");
        elem.replaceChildren()
        rooms = json.data.forEach((name) =>
          elem.appendChild(room_element(name))
        );
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

    console.log("wok" + name);
 frame.nav.game.click()
  };
  let x = document.getElementById('name-room')
  x.value = ''
  return wrap;
}

const send = function (params) {
  ws.send(JSON.stringify(params));
};

function get_room() {
  send({ action: "get-room" });
}

console.warn("hiie");
const id = (name) => document.getElementById(name);
const cls = (name) => document.getElementsByClassName(name);
const scr = {
  start: "start",
  room: "room",
  user: "user",
  game: "game",
};

const fake_room = ["one-game", "second-game"];

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
    setTimeout(() => send({ action: "get-room" }), 100);

    open(frame.room);
  };
  frame.nav.user.onclick = () => open(frame.user);
  frame.nav.start.onclick = () => open(frame.start);

  // frame.nav.start.click()
  id("new-game").onclick = () => frame.nav.room.click();
  id("new-room").onclick = () => {
    const val = document.getElementById("name-room").value 
    console.log(val);
    send({
      action: "create-room",
      data: val,
    });

    setTimeout(() => send({ action: "get-room" }), 100);
  };
  frame.nav.room.click();
};

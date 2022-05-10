
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

// ws.onmessage

//window onload

  frame.nav.game.onclick = () => {
    open(frame.game);
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

  //server

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

    if (req.action === "get-room")
      ws.send(
        JSON.stringify({
          action: "get-room",
          data: room.list(),
        })
      );
          if (req.action === "create-room") room.create(req.data);
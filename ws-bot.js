const WebSocket = require("ws").WebSocket;
const ws = new WebSocket("ws://localhost:9000");
let id = null;

ws.onopen = () => console.log("connected");
ws.onerror = (err) => console.log(err);
ws.onmessage = (msg) => {
  const { action, data } = JSON.parse(msg.data);
  if (action === "create") id = data.id;
};

setInterval(() => {
  const move = ["ArrowDown",  "ArrowLeft"];
  let last
  const rnd_index = Math.floor(Math.random() * move.length);
  const rnd_elem = Array.from(move.values())[rnd_index];
  console.log(rnd_elem);
  ws.send(JSON.stringify({ action: "move", id: id, dir: rnd_elem }));
}, 5);

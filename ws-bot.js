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
  let lastDir = "ArrowUp";
  const move = {
    ArrowUp: ["ArrowLeft", "ArrowUp", "ArrowRight"],
    ArrowRight: ["ArrowUp", "ArrowRight", "ArrowDown"],
    ArrowDown: ["ArrowLeft", "ArrowDown", "ArrowRight"],
    ArrowLeft: ["ArrowUp", "ArrowLeft", "ArrowDown"],
  }

  

  lastDir = Array.from(move[lastDir].values())[Math.floor(Math.random() * 3)];
  ws.send(JSON.stringify({ action: "move", id: id, dir: lastDir }));
}, 100);

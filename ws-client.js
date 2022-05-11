const display = {
  id: null,
  update(data) {
    const [setting, objs] = data;
    const canvas = document.getElementById("game-canvas");
    canvas.width = setting.x * setting.px;
    canvas.height = setting.y * setting.px;
    const context = canvas.getContext("2d");
    const paint = (x, y, px, color) => {
        context.fillStyle = color;
        context.fillRect( (x * px) + 1, (y * px) +1 , px -2 , px-2);
    }

    objs.forEach(([prop, cord]) => {
      if(prop.type === "s"){
        console.log(prop)
        const head = cord[0]
        const [x,y] = head;
        paint(x,y,setting.px,prop.color)
        prop.sens.forEach(([x,y])=>{
          paint(x,y,setting.px,'yellow')
        })
      }

      cord.forEach(([x, y]) => {
        paint(x,y,setting.px,prop.color)
      });
    });
  },
};

const ws = new WebSocket("ws://localhost:9000");
ws.onopen = () => console.log("connected");
ws.onerror = (err) => console.log(err);
ws.onmessage = (msg) => {
  const { action, data } = JSON.parse(msg.data);
  console.log(data)
  if (action === "create") display.id = data.id;
  if (action === "update") display.update(data);
};

document.onkeydown = function (e) {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
      ws.send(JSON.stringify({ action: "move", id: display.id, dir: e.key }));
  }
};

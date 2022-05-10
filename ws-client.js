const ws = new WebSocket('ws://localhost:9000');
ws.onopen = () => console.log('connected');
ws.onerror = (err) => console.log(err);
ws.onmessage = (msg) => {
  const { action, data } = JSON.parse(msg.data);
  if (action === 'socket-id') display.id = data.id;
  if (action === 'update') display.update(data);
};


const display = {
  canvas: null,
  id: null,
  update(data){
    const [setting, objs] = data;
    const canvas = document.getElementById('game-canvas');
    canvas.width = setting.x * setting.px;
    canvas.height = setting.y * setting.px;
    const context = canvas.getContext('2d');

    objs.forEach(([prop,cord])=>{
      cord.forEach(([x,y])=>{
        context.fillStyle = prop.color
        context.fillRect(x * setting.px, y * setting.px, setting.px, setting.px);
      }) } )
  },

  render(game_obj) {
    game_obj.forEach(([prop,cord])=>{
      cord.forEach(([x,y])=>{
        this.canvas.fillStyle = prop.color
        this.canvas.fillRect(x * px, y * px, px, px);
      }) } )
  },
}

document.onkeydown = function (e) {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
      ws.send(JSON.stringify({action: 'move', id:display.id, dir:e.key}))
  }
};
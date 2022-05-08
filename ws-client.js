const ws = new WebSocket('ws://localhost:9000');
ws.req = json => ws.send(JSON.stringify(json));
ws.res = text => JSON.parse(text);
ws.onopen = () => console.log('connected');
ws.onerror = (err) => console.log(err);
ws.onmessage = (msg) => {
  const { action, data } = ws.res(msg.data);
  if (action === 'update') map.update(data);
  if (action === 'socket-id') map.set_id(data.id);
};

const map = {
  size: {},
  game_field: null,
  player_id: null,

  wall: [],
  berry: [],
  serpentarium: [],
  player_snake: {
    id: "",
    x: 0,
    y: 0,
    len: 3,
    tail: [],

    move(dir) {
      this.tail_update();
      this.change_position(dir);
      ws.req({
        action: 'move',
        data: {
          id: map.player_id,
          tail: this.tail,
          head: { x: this.x, y: this.y },
        },
      });
    },

    tail_update() {
      this.tail.unshift([this.x / map.size.s, this.y / map.size.s]);
      if (this.tail.length > this.len) {
        let drop = this.tail.pop();
        map.game_field.clearRect(drop.x, drop.y, map.size.s, map.size.s);
      }
    },

    change_position(dir) {
      let ms = map.size.s;
      let mx = map.size.x - 1;
      let my = map.size.y - 1;
      if (dir === 'ArrowRight') this.x = this.x >= ms * mx ? 0 : this.x + ms;
      if (dir === 'ArrowDown') this.y = this.y >= ms * my ? 0 : this.y + ms;
      if (dir === 'ArrowLeft') this.x = this.x <= 0 ? ms * mx : this.x - ms;
      if (dir === 'ArrowUp') this.y = this.y <= 0 ? ms * my : this.y - ms;
    },
  },
  set_id(id) {
    this.player_id = id;
    this.player_snake.id = id;
  },

  update(data) {
    this.size = data.size;
    this.serpentarium = data.snakes;
    this.berry = data.berry;
    this.wall = data.wall;

    this.create_field();
  },

  create_field() {
    const id = (name) => document.getElementById(name);
    const canvas = id('game-canvas');
    canvas.width = this.size.x * this.size.s;
    canvas.height = this.size.y * this.size.s;
    this.game_field = canvas.getContext('2d');

    this.render();
  },

  render() {
    this.berry.forEach(([x, y]) => {
      this.paint(x, y, "berry");
    });
    this.wall.forEach(([x, y]) => {
      this.paint(x, y, "wall");
    });

    Object.values(this.serpentarium).forEach(({ id, head, tail }) => {
      if (id === this.player_id) {
        this.player_snake.x = head.x;
        this.player_snake.y = head.y;
        this.player_snake.tail = tail;
      }
      this.paint(head.x / this.size.s, head.y / this.size.s, "snake");
      tail.forEach(([x, y]) => {
        this.paint(x, y, "tail");
      });
    });
  },

  paint(x, y, color) {
    const s = this.size.s;
    const color_map = {
      snake: "#FA0556",
      tail: "#A00034",
      empty: "#000000",
      wall: "#00FF00",
      berry: "#0000FF",
    };
    this.game_field.fillStyle = color_map[color];
    this.game_field.fillRect(x * s, y * s, s, s);
  },
};

document.onkeydown = function (e) {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
      map.player_snake.move(e.key);
  }
};

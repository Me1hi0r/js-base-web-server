let canvas = document.querySelector("#game-canvas");
let context = canvas.getContext("2d");

const score = {
  score: 0,
  scoreBlock: document.querySelector(".game-score .score-count"),
  update_score: function () {
    this.scoreBlock.innerHTML = this.score;
  },
  increase_score: function () {
    this.score++;
    this.update_score();
  },
};

const response = {
  size: {
    h: 10,
    w: 10,
    s: 16,
  },
  wall: [[9,10], [3,5], [3,9], [3,2], [5,8]],
  berry: [[3,4], [8,2], [7,3]],
  snake: [
    {
      head: { h: 7, w: 8 },
      tail: [[9,8], [9,0]],
    },
    {
      head: { h: 4, w: 5 },
      tail: [[4,0], [4,1]],
    },
  ],
};

const render = function (prop) {
  const color = {
    head: "#FA0556",
    tail: "#A00034",
    empty: "#000000",
    wall: "#00FF00",
    berry: "#0000FF",
  };


  console.log("render");
  const canvas = by_id("game-canvas");
  canvas.width = prop.size.w * prop.size.s;
  canvas.height = prop.size.h * prop.size.s;
  ["wall", "berry"].forEach((obj) => subrend(prop, obj));
  // for (let wall of prop.wall) {
  //   console.log(wall.x, wall.y);
  //   paint(wall.x, wall.y, color.wall);
  // }

  // for (let e of this.berrys) {
  //   paint(e.x, e.y, color.berry);
  // }
  function subrend(prop, obj) {
    for (let [x, y] of prop[obj]) {
      console.log(x, y);
      paint(x, y, color[obj]);
    }
    function paint(x, y, color) {
      context.fillStyle = color;
      context.fillRect(x, y, map.size, map.size);
    }
  }
};

const color = {
  head: "#FA0556",
  tail: "#A00034",
  empty: "#000000",
  wall: "#00FF00",
  berry: "#0000FF",
};

const map = {
  col: 20,
  row: 20,
  size: 16,
  berry: 3,
  wall: 5,
  berrys: [],
  walls: [],
  check_collision(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  },
  rand_cord: function () {
    let x = this.rand(this.col);
    let y = this.rand(this.row);

    for (let e of this.berrys)
      if (this.check_collision(e, { x: x, y: y })) return this.rand_cord();

    for (let e of this.walls)
      if (this.check_collision(e, { x: x, y: y })) return this.rand_cord();

    return { x: x, y: y };
  },

  rand: function (val) {
    return getRandomInt(0, val) * this.size;
  },

  render: function () {
    console.log("render");
    for (let e of this.walls) {
      console.log(e.x, e.y);
      paint(e.x, e.y, color.wall);
    }

    for (let e of this.berrys) {
      paint(e.x, e.y, color.berry);
    }
  },
  init: function () {
    console.log("init");
    const canvas = by_id("game-canvas");
    canvas.width = this.col * this.size;
    canvas.height = this.row * this.size;
    for (let i = 0; i < this.berry; i++) {
      this.berrys.push(this.rand_cord());
    }
    for (let i = 0; i < this.wall; i++) {
      this.walls.push(this.rand_cord());
    }
  },
  reset: function () {
    this.berrys = [];
    this.walls = [];
    this.init();
    this.render();
  },
};

window.onload = () => {
//   map.reset();
  console.log("map reset");
};

let berry = {
  x: 0,
  y: 0,
  new: function (params) {
    (this.x = params.x),
      (this.y = params.y),
      paint(params.x, params.y, color.head);
  },
};

const s = {
  x: 0,
  y: 0,
  len: 3,
  tail: [],

  eat: function () {
    this.len++;
  },

  check_food: function (map) {
    for (const berry of map.berrys)
      if (this.x == berry.x && this.y == berry.y) return true;
    return false;
  },
  check_wall: function (map) {
    for (const wall of map.walls)
      if (this.x == wall.x && this.y == wall.y) return true;
    return false;
  },

  check: function (map) {
    if (this.check_wall(map)) map.reset();
    if (this.check_food(map)) {
      this.eat();
      score.increase_score();
    }
    this.render();
    return this;
  },

  render: function () {
    paint(this.x, this.y, color.head);
    this.tail.forEach((e) => paint(e.x, e.y, color.tail));

    this.tail.unshift({ x: this.x, y: this.y });
    if (this.tail.length > this.len) {
      let drop = this.tail.pop();
      context.clearRect(drop.x, drop.y, map.size, map.size);
    }
  },

  left: function () {
    this.x = this.x <= 0 ? map.size * (map.col - 1) : this.x - map.size;
    this.check(map);
  },
  right: function () {
    this.x = this.x >= map.size * (map.col - 1) ? 0 : this.x + map.size;
    this.check(map);
  },
  down: function () {
    this.y = this.y >= map.size * (map.row - 1) ? 0 : this.y + map.size;
    this.check(map);
  },
  up: function () {
    this.y = this.y <= 0 ? map.size * (map.row - 1) : this.y - map.size;
    this.check(map);
  },
};

function by_id(id) {
  return document.getElementById(id);
}

function init_map(params) {
  const canvas = by_id("game-canvas");
  canvas.width = params.col * params.size;
  canvas.height = params.row * params.size;
}

function paint(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x, y, map.size, map.size);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

const key = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};

document.addEventListener("keydown", function (e) {
  console.log(e);
  switch (e.key) {
    case key.up:
      s.up();
      break;
    case key.down:
      s.down();
      break;
    case key.left:
      s.left();
      break;
    case key.right:
      s.right();
      break;
    default:
      break;
  }
});

// добавить динамику чем больше ешь тем больше преград

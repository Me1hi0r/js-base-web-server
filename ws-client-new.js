const id = (name) => document.getElementById(name);
const cls = (name) => document.getElementsByClassName(name);
const scr = {
  start: "start",
  room: "room",
  user: "user",
  game: "game",
};

const frame = {
  start: id("sart-screen"),
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
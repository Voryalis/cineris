import { Camera } from "./camera.js";
import { Engine } from "./engine.js";
import { Input } from "./input.js";
import { Player } from "./player.js";
import { Renderer } from "./renderer.js";
import { World } from "./world.js";

const canvas = document.querySelector("#city");

const world = new World();
const player = new Player();
const camera = new Camera();
const input = new Input(canvas);
const renderer = new Renderer(canvas);

const engine = new Engine({
  camera,
  input,
  player,
  renderer,
  world,
});

engine.start();
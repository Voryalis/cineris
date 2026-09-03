import { Camera } from "./camera.js";
import { Engine } from "./engine.js";
import { Input } from "./input.js";
import { Interaction } from "./interaction.js";
import { Player } from "./player.js";
import { Renderer } from "./renderer.js";
import { SPAWN } from "./map.js";
import { World } from "./world.js";

const canvas = document.querySelector("#city");

const world = new World();
const player = new Player();
const camera = new Camera();
const input = new Input(canvas);
const interaction = new Interaction();
const renderer = new Renderer(canvas);

player.x = SPAWN.x;
player.y = SPAWN.y;
camera.yaw = SPAWN.yaw;

const engine = new Engine({
  camera,
  input,
  interaction,
  player,
  renderer,
  world,
});

engine.start();
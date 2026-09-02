import { Engine } from "./engine.js";
import { Input } from "./input.js";
import { Player } from "./player.js";
import { Renderer } from "./renderer.js";
import { World } from "./world.js";

const canvas = document.querySelector("#city");
const world = new World();
const player = new Player();
const input = new Input();
const renderer = new Renderer(canvas);
const engine = new Engine({ input, player, renderer, world });

canvas.addEventListener("pointerdown", () => canvas.focus());
engine.start();

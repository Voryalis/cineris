const directionByKey = new Map([
  ["ArrowUp", [0, -1]],
  ["ArrowDown", [0, 1]],
  ["ArrowLeft", [-1, 0]],
  ["ArrowRight", [1, 0]],
  ["w", [0, -1]],
  ["s", [0, 1]],
  ["a", [-1, 0]],
  ["d", [1, 0]],
]);

export class Input {
  #keys = new Set();

  constructor(target = window) {
    target.addEventListener("keydown", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (directionByKey.has(key)) event.preventDefault();
      this.#keys.add(key);
    });

    target.addEventListener("keyup", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      this.#keys.delete(key);
    });

    window.addEventListener("blur", () => this.#keys.clear());
  }

  direction() {
    for (const [key, direction] of directionByKey) {
      if (this.#keys.has(key)) return direction;
    }
    return null;
  }
}

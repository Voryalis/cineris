const normalizeKey = (key) =>
  key.length === 1 ? key.toLowerCase() : key;

export class Input {
  #keys = new Set();
  #mouseX = 0;
  #mouseY = 0;

  constructor(canvas) {
    window.addEventListener("keydown", (event) => {
      const key = normalizeKey(event.key);

      if (
        [
          "w",
          "a",
          "s",
          "d",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(key)
      ) {
        event.preventDefault();
      }

      this.#keys.add(key);
    });

    window.addEventListener("keyup", (event) => {
      this.#keys.delete(normalizeKey(event.key));
    });

    window.addEventListener("blur", () => {
      this.#keys.clear();
    });

    canvas.addEventListener("pointerdown", () => {
      canvas.focus();
      canvas.requestPointerLock();
    });

    document.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement !== canvas) return;

      this.#mouseX += event.movementX;
      this.#mouseY += event.movementY;
    });
  }

  movement() {
    return {
      forward:
        Number(this.#keys.has("w")) -
        Number(this.#keys.has("s")),

      strafe:
        Number(this.#keys.has("d")) -
        Number(this.#keys.has("a")),
    };
  }

  look() {
    return {
      yaw:
        Number(this.#keys.has("ArrowRight")) -
        Number(this.#keys.has("ArrowLeft")),

      pitch:
        Number(this.#keys.has("ArrowUp")) -
        Number(this.#keys.has("ArrowDown")),
    };
  }

  consumeMouse() {
    const movement = {
      x: this.#mouseX,
      y: this.#mouseY,
    };

    this.#mouseX = 0;
    this.#mouseY = 0;

    return movement;
  }
}
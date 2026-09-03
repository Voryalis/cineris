import {
  FOV,
  MAX_DEPTH,
} from "./config.js";

export const renderGround = ({
  buffer,
  colorBuffer,
  depthBuffer,
  player,
  camera,
  columns,
  rows,
  cellAspect,
  colorNear,
  colorMid,
  colorFar,
}) => {
  const focalX =
    columns /
    (
      2 *
      Math.tan(
        FOV / 2,
      )
    );

  const focalY =
    focalX *
    cellAspect;

  const cosPitch =
    Math.cos(
      camera.pitch,
    );

  const sinPitch =
    Math.sin(
      camera.pitch,
    );

  for (
    let row = 0;
    row < rows;
    row += 1
  ) {
    const screenY =
      row + 0.5;

    const cameraY =
      (
        rows / 2 -
        screenY
      ) /
      focalY;

    const worldZ =
      cameraY *
      cosPitch +
      sinPitch;

    if (
      worldZ >=
      -0.00001
    ) {
      continue;
    }

    const depth =
      -player.z /
      worldZ;

    if (
      depth <= 0 ||
      depth > MAX_DEPTH
    ) {
      continue;
    }

    let glyph = ".";
    let color =
      colorFar;

    if (depth < 7) {
      glyph = "·";
      color =
        colorNear;
    } else if (
      depth < 18
    ) {
      glyph = ".";
      color =
        colorMid;
    } else {
      glyph =
        row % 3 === 0
          ? "."
          : "·";

      color =
        colorFar;
    }

    for (
      let column = 0;
      column < columns;
      column += 1
    ) {
      buffer[row][column] =
        glyph;

      colorBuffer[
        row
      ][
        column
      ] =
        color;

      depthBuffer[
        row
      ][
        column
      ] =
        depth;
    }
  }
};
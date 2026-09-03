import {
  projectTriangle,
} from "./geometry.js";

export const createDepthBuffer = (
  rows,
  columns,
) =>
  Array.from(
    { length: rows },
    () =>
      Array(
        columns,
      ).fill(
        Infinity,
      ),
  );

const EPSILON =
  0.000001;

const edge = (
  a,
  b,
  x,
  y,
) =>
  (
    x - a.x
  ) *
  (
    b.y - a.y
  ) -
  (
    y - a.y
  ) *
  (
    b.x - a.x
  );

const glyphFor = (
  style,
  depth,
  x,
  y,
) => {
  const glyphs =
    style.glyphs ??
    ["."];

  const distanceBand =
    Math.min(
      glyphs.length - 1,
      Math.floor(
        depth / 8,
      ),
    );

  const base =
    glyphs[
    distanceBand
    ];

  if (
    style.pattern &&
    (
      x + y
    ) %
    style.pattern.interval ===
    0
  ) {
    return (
      style.pattern.glyph ??
      base
    );
  }

  return base;
};

export const rasterizeProjectedTriangle = (
  triangle,
  buffer,
  colorBuffer,
  depthBuffer,
  style,
) => {
  const [
    a,
    b,
    c,
  ] = triangle.points;

  const rows =
    buffer.length;

  const columns =
    buffer[0].length;

  const minX =
    Math.max(
      0,
      Math.floor(
        Math.min(
          a.x,
          b.x,
          c.x,
        ),
      ),
    );

  const maxX =
    Math.min(
      columns - 1,
      Math.ceil(
        Math.max(
          a.x,
          b.x,
          c.x,
        ),
      ),
    );

  const minY =
    Math.max(
      0,
      Math.floor(
        Math.min(
          a.y,
          b.y,
          c.y,
        ),
      ),
    );

  const maxY =
    Math.min(
      rows - 1,
      Math.ceil(
        Math.max(
          a.y,
          b.y,
          c.y,
        ),
      ),
    );

  if (
    minX > maxX ||
    minY > maxY
  ) {
    return;
  }

  const area =
    edge(
      a,
      b,
      c.x,
      c.y,
    );

  if (
    Math.abs(area) <
    EPSILON
  ) {
    return;
  }

  const orientation =
    area < 0
      ? -1
      : 1;

  const inverseArea =
    1 / area;

  const e0StepX =
    c.y - b.y;

  const e0StepY =
    b.x - c.x;

  const e1StepX =
    a.y - c.y;

  const e1StepY =
    c.x - a.x;

  const e2StepX =
    b.y - a.y;

  const e2StepY =
    a.x - b.x;

  const startX =
    minX + 0.5;

  const startY =
    minY + 0.5;

  let rowE0 =
    edge(
      b,
      c,
      startX,
      startY,
    );

  let rowE1 =
    edge(
      c,
      a,
      startX,
      startY,
    );

  let rowE2 =
    edge(
      a,
      b,
      startX,
      startY,
    );

  const inverseDepthStepX =
    (
      e0StepX *
      a.inverseDepth +
      e1StepX *
      b.inverseDepth +
      e2StepX *
      c.inverseDepth
    ) *
    inverseArea;

  const inverseDepthStepY =
    (
      e0StepY *
      a.inverseDepth +
      e1StepY *
      b.inverseDepth +
      e2StepY *
      c.inverseDepth
    ) *
    inverseArea;

  let rowInverseDepth =
    (
      rowE0 *
      a.inverseDepth +
      rowE1 *
      b.inverseDepth +
      rowE2 *
      c.inverseDepth
    ) *
    inverseArea;

  for (
    let y = minY;
    y <= maxY;
    y += 1
  ) {
    let e0 =
      rowE0;

    let e1 =
      rowE1;

    let e2 =
      rowE2;

    let inverseDepth =
      rowInverseDepth;

    const depthRow =
      depthBuffer[y];

    const bufferRow =
      buffer[y];

    const colorRow =
      colorBuffer[y];

    for (
      let x = minX;
      x <= maxX;
      x += 1
    ) {
      const inside =
        e0 *
        orientation >=
        -EPSILON &&
        e1 *
        orientation >=
        -EPSILON &&
        e2 *
        orientation >=
        -EPSILON;

      if (
        inside &&
        inverseDepth >
        EPSILON
      ) {
        const depth =
          1 /
          inverseDepth;

        if (
          depth <
          depthRow[x]
        ) {
          depthRow[x] =
            depth;

          bufferRow[x] =
            glyphFor(
              style,
              depth,
              x,
              y,
            );

          colorRow[x] =
            style.color;
        }
      }

      e0 +=
        e0StepX;

      e1 +=
        e1StepX;

      e2 +=
        e2StepX;

      inverseDepth +=
        inverseDepthStepX;
    }

    rowE0 +=
      e0StepY;

    rowE1 +=
      e1StepY;

    rowE2 +=
      e2StepY;

    rowInverseDepth +=
      inverseDepthStepY;
  }
};

export const rasterizeMesh = ({
  mesh,
  player,
  camera,
  columns,
  rows,
  cellAspect,
  buffer,
  colorBuffer,
  depthBuffer,
  styleForMaterial,
}) => {
  for (
    const face
    of mesh
  ) {
    const style =
      styleForMaterial(
        face.material,
      );

    if (!style) {
      continue;
    }

    const projected =
      projectTriangle(
        face,
        player,
        camera,
        columns,
        rows,
        cellAspect,
      );

    for (
      const triangle
      of projected
    ) {
      rasterizeProjectedTriangle(
        triangle,
        buffer,
        colorBuffer,
        depthBuffer,
        style,
      );
    }
  }
};
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
      x +
      y
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
      buffer[0].length - 1,
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
      buffer.length - 1,
      Math.ceil(
        Math.max(
          a.y,
          b.y,
          c.y,
        ),
      ),
    );

  const area =
    edge(
      a,
      b,
      c.x,
      c.y,
    );

  if (
    Math.abs(area) <
    0.00001
  ) {
    return;
  }

  for (
    let y = minY;
    y <= maxY;
    y += 1
  ) {
    for (
      let x = minX;
      x <= maxX;
      x += 1
    ) {
      const px =
        x + 0.5;

      const py =
        y + 0.5;

      const w0 =
        edge(
          b,
          c,
          px,
          py,
        ) /
        area;

      const w1 =
        edge(
          c,
          a,
          px,
          py,
        ) /
        area;

      const w2 =
        edge(
          a,
          b,
          px,
          py,
        ) /
        area;

      const inside =
        w0 >= 0 &&
        w1 >= 0 &&
        w2 >= 0;

      if (!inside) {
        continue;
      }

      const inverseDepth =
        w0 *
        a.inverseDepth +
        w1 *
        b.inverseDepth +
        w2 *
        c.inverseDepth;

      if (
        inverseDepth <= 0
      ) {
        continue;
      }

      const depth =
        1 /
        inverseDepth;

      if (
        depth >=
        depthBuffer[y][x]
      ) {
        continue;
      }

      depthBuffer[y][x] =
        depth;

      buffer[y][x] =
        glyphFor(
          style,
          depth,
          x,
          y,
        );

      colorBuffer[y][x] =
        style.color;
    }
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
    const projected =
      projectTriangle(
        face,
        player,
        camera,
        columns,
        rows,
        cellAspect,
      );

    const style =
      styleForMaterial(
        face.material,
      );

    if (!style) {
      continue;
    }

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
import { FOV } from "./config.js";

export const NEAR_PLANE = 0.05;

export const vertex = (
  x,
  y,
  z,
) => ({
  x,
  y,
  z,
});

export const triangle = (
  a,
  b,
  c,
  material,
) => ({
  a,
  b,
  c,
  material,
});

export const quad = (
  a,
  b,
  c,
  d,
  material,
) => [
    triangle(
      a,
      b,
      c,
      material,
    ),
    triangle(
      a,
      c,
      d,
      material,
    ),
  ];

const interpolate = (
  a,
  b,
  t,
) => ({
  x:
    a.x +
    (b.x - a.x) * t,

  y:
    a.y +
    (b.y - a.y) * t,

  z:
    a.z +
    (b.z - a.z) * t,
});

export const worldToCamera = (
  point,
  player,
  camera,
) => {
  const dx =
    point.x - player.x;

  const dy =
    point.y - player.y;

  const dz =
    point.z - player.z;

  const cosYaw =
    Math.cos(camera.yaw);

  const sinYaw =
    Math.sin(camera.yaw);

  const right =
    -sinYaw * dx +
    cosYaw * dy;

  const forward =
    cosYaw * dx +
    sinYaw * dy;

  const cosPitch =
    Math.cos(camera.pitch);

  const sinPitch =
    Math.sin(camera.pitch);

  const vertical =
    dz * cosPitch -
    forward * sinPitch;

  const depth =
    forward * cosPitch +
    dz * sinPitch;

  return {
    x: right,
    y: vertical,
    z: depth,
  };
};

const clipEdge = (
  a,
  b,
  near,
) => {
  const t =
    (near - a.z) /
    (b.z - a.z);

  return interpolate(
    a,
    b,
    t,
  );
};

export const clipTriangleNear = (
  points,
  near = NEAR_PLANE,
) => {
  const output = [];

  for (
    let index = 0;
    index < points.length;
    index += 1
  ) {
    const current =
      points[index];

    const previous =
      points[
      (
        index +
        points.length -
        1
      ) %
      points.length
      ];

    const currentInside =
      current.z >= near;

    const previousInside =
      previous.z >= near;

    if (
      currentInside &&
      previousInside
    ) {
      output.push(
        current,
      );

      continue;
    }

    if (
      previousInside &&
      !currentInside
    ) {
      output.push(
        clipEdge(
          previous,
          current,
          near,
        ),
      );

      continue;
    }

    if (
      !previousInside &&
      currentInside
    ) {
      output.push(
        clipEdge(
          previous,
          current,
          near,
        ),
      );

      output.push(
        current,
      );
    }
  }

  if (
    output.length < 3
  ) {
    return [];
  }

  if (
    output.length === 3
  ) {
    return [
      output,
    ];
  }

  return [
    [
      output[0],
      output[1],
      output[2],
    ],
    [
      output[0],
      output[2],
      output[3],
    ],
  ];
};

export const projectVertex = (
  point,
  columns,
  rows,
  cellAspect,
) => {
  if (
    point.z <= 0
  ) {
    return null;
  }

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

  return {
    x:
      columns / 2 +
      (
        point.x /
        point.z
      ) *
      focalX,

    y:
      rows / 2 -
      (
        point.y /
        point.z
      ) *
      focalY,

    depth:
      point.z,

    inverseDepth:
      1 / point.z,
  };
};

export const projectTriangle = (
  face,
  player,
  camera,
  columns,
  rows,
  cellAspect,
) => {
  const cameraPoints = [
    worldToCamera(
      face.a,
      player,
      camera,
    ),
    worldToCamera(
      face.b,
      player,
      camera,
    ),
    worldToCamera(
      face.c,
      player,
      camera,
    ),
  ];

  const clipped =
    clipTriangleNear(
      cameraPoints,
    );

  const result = [];

  for (
    const points
    of clipped
  ) {
    const projected =
      points.map(
        (point) =>
          projectVertex(
            point,
            columns,
            rows,
            cellAspect,
          ),
      );

    if (
      projected.some(
        (point) => !point,
      )
    ) {
      continue;
    }

    result.push({
      points: projected,
      material:
        face.material,
    });
  }

  return result;
};
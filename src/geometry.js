import {
  FOV,
  MAX_DEPTH,
} from "./config.js";

export const NEAR_PLANE = 0.08;

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
    Math.cos(
      camera.yaw,
    );

  const sinYaw =
    Math.sin(
      camera.yaw,
    );

  const right =
    -sinYaw * dx +
    cosYaw * dy;

  const forward =
    cosYaw * dx +
    sinYaw * dy;

  const cosPitch =
    Math.cos(
      camera.pitch,
    );

  const sinPitch =
    Math.sin(
      camera.pitch,
    );

  return {
    x: right,

    y:
      dz * cosPitch -
      forward * sinPitch,

    z:
      forward * cosPitch +
      dz * sinPitch,
  };
};

const interpolatePlane = (
  a,
  b,
  plane,
) => {
  const difference =
    b.z - a.z;

  if (
    Math.abs(
      difference,
    ) < 0.000001
  ) {
    return {
      ...a,
      z: plane,
    };
  }

  const t =
    (
      plane - a.z
    ) /
    difference;

  return interpolate(
    a,
    b,
    t,
  );
};

const clipAgainstNearPlane = (
  points,
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
      current.z >=
      NEAR_PLANE;

    const previousInside =
      previous.z >=
      NEAR_PLANE;

    if (
      previousInside &&
      currentInside
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
        interpolatePlane(
          previous,
          current,
          NEAR_PLANE,
        ),
      );

      continue;
    }

    if (
      !previousInside &&
      currentInside
    ) {
      output.push(
        interpolatePlane(
          previous,
          current,
          NEAR_PLANE,
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

const isBackFacing = (
  points,
) => {
  const [
    a,
    b,
    c,
  ] = points;

  const abX =
    b.x - a.x;

  const abY =
    b.y - a.y;

  const abZ =
    b.z - a.z;

  const acX =
    c.x - a.x;

  const acY =
    c.y - a.y;

  const acZ =
    c.z - a.z;

  const normalX =
    abY * acZ -
    abZ * acY;

  const normalY =
    abZ * acX -
    abX * acZ;

  const normalZ =
    abX * acY -
    abY * acX;

  const centerX =
    (
      a.x +
      b.x +
      c.x
    ) / 3;

  const centerY =
    (
      a.y +
      b.y +
      c.y
    ) / 3;

  const centerZ =
    (
      a.z +
      b.z +
      c.z
    ) / 3;

  return (
    normalX * centerX +
    normalY * centerY +
    normalZ * centerZ
  ) >= 0;
};

export const projectVertex = (
  point,
  columns,
  rows,
  cellAspect,
) => {
  if (
    point.z <
    NEAR_PLANE
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

const outsideScreen = (
  points,
  columns,
  rows,
) => {
  const left =
    points.every(
      (point) =>
        point.x < 0,
    );

  const right =
    points.every(
      (point) =>
        point.x >=
        columns,
    );

  const above =
    points.every(
      (point) =>
        point.y < 0,
    );

  const below =
    points.every(
      (point) =>
        point.y >=
        rows,
    );

  return (
    left ||
    right ||
    above ||
    below
  );
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

  if (
    cameraPoints.every(
      (point) =>
        point.z <
        NEAR_PLANE,
    )
  ) {
    return [];
  }

  if (
    cameraPoints.every(
      (point) =>
        point.z >
        MAX_DEPTH,
    )
  ) {
    return [];
  }

  if (
    isBackFacing(
      cameraPoints,
    )
  ) {
    return [];
  }

  const clipped =
    clipAgainstNearPlane(
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
        (point) =>
          !point,
      )
    ) {
      continue;
    }

    if (
      outsideScreen(
        projected,
        columns,
        rows,
      )
    ) {
      continue;
    }

    result.push({
      points:
        projected,

      material:
        face.material,
    });
  }

  return result;
};
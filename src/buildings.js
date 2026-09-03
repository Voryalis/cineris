import {
  quad,
  triangle,
  vertex,
} from "./geometry.js";

import {
  MATERIAL,
} from "./architecture.js";

export const SURFACE = Object.freeze({
  CHURCH_ROOF: "church-roof",
  CHURCH_DOME: "church-dome",
  HOUSE_ROOF: "house-roof",
  LIBRARY_ROOF: "library-roof",
  CROSS: "cross",
});

const box = (
  x1,
  y1,
  x2,
  y2,
  z1,
  z2,
  material,
) => {
  const a = vertex(x1, y1, z1);
  const b = vertex(x2, y1, z1);
  const c = vertex(x2, y2, z1);
  const d = vertex(x1, y2, z1);

  const e = vertex(x1, y1, z2);
  const f = vertex(x2, y1, z2);
  const g = vertex(x2, y2, z2);
  const h = vertex(x1, y2, z2);

  return [
    ...quad(a, b, f, e, material),
    ...quad(b, c, g, f, material),
    ...quad(c, d, h, g, material),
    ...quad(d, a, e, h, material),

    ...quad(e, f, g, h, material),
  ];
};

const gableRoofX = (
  x1,
  y1,
  x2,
  y2,
  baseZ,
  ridgeZ,
  material,
) => {
  const middleY =
    (y1 + y2) / 2;

  const a =
    vertex(x1, y1, baseZ);

  const b =
    vertex(x2, y1, baseZ);

  const c =
    vertex(x2, y2, baseZ);

  const d =
    vertex(x1, y2, baseZ);

  const r1 =
    vertex(
      x1,
      middleY,
      ridgeZ,
    );

  const r2 =
    vertex(
      x2,
      middleY,
      ridgeZ,
    );

  return [
    ...quad(
      a,
      b,
      r2,
      r1,
      material,
    ),

    ...quad(
      r1,
      r2,
      c,
      d,
      material,
    ),

    triangle(
      a,
      r1,
      d,
      material,
    ),

    triangle(
      b,
      c,
      r2,
      material,
    ),
  ];
};

const gableRoofY = (
  x1,
  y1,
  x2,
  y2,
  baseZ,
  ridgeZ,
  material,
) => {
  const middleX =
    (x1 + x2) / 2;

  const a =
    vertex(x1, y1, baseZ);

  const b =
    vertex(x2, y1, baseZ);

  const c =
    vertex(x2, y2, baseZ);

  const d =
    vertex(x1, y2, baseZ);

  const r1 =
    vertex(
      middleX,
      y1,
      ridgeZ,
    );

  const r2 =
    vertex(
      middleX,
      y2,
      ridgeZ,
    );

  return [
    ...quad(
      a,
      r1,
      r2,
      d,
      material,
    ),

    ...quad(
      r1,
      b,
      c,
      r2,
      material,
    ),

    triangle(
      a,
      b,
      r1,
      material,
    ),

    triangle(
      d,
      r2,
      c,
      material,
    ),
  ];
};

const pyramidRoof = (
  x1,
  y1,
  x2,
  y2,
  baseZ,
  peakZ,
  material,
) => {
  const a =
    vertex(x1, y1, baseZ);

  const b =
    vertex(x2, y1, baseZ);

  const c =
    vertex(x2, y2, baseZ);

  const d =
    vertex(x1, y2, baseZ);

  const peak =
    vertex(
      (x1 + x2) / 2,
      (y1 + y2) / 2,
      peakZ,
    );

  return [
    triangle(
      a,
      b,
      peak,
      material,
    ),

    triangle(
      b,
      c,
      peak,
      material,
    ),

    triangle(
      c,
      d,
      peak,
      material,
    ),

    triangle(
      d,
      a,
      peak,
      material,
    ),
  ];
};

const dome = (
  centerX,
  centerY,
  baseZ,
  radius,
  height,
  segments = 12,
  rings = 4,
) => {
  const faces = [];
  const ringsData = [];

  for (
    let ring = 0;
    ring < rings;
    ring += 1
  ) {
    const t =
      ring / rings;

    const angle =
      t *
      Math.PI /
      2;

    const ringRadius =
      Math.cos(angle) *
      radius;

    const z =
      baseZ +
      Math.sin(angle) *
      height;

    const points = [];

    for (
      let segment = 0;
      segment < segments;
      segment += 1
    ) {
      const theta =
        (
          segment /
          segments
        ) *
        Math.PI *
        2;

      points.push(
        vertex(
          centerX +
          Math.cos(theta) *
          ringRadius,

          centerY +
          Math.sin(theta) *
          ringRadius,

          z,
        ),
      );
    }

    ringsData.push(
      points,
    );
  }

  for (
    let ring = 0;
    ring <
    ringsData.length - 1;
    ring += 1
  ) {
    const lower =
      ringsData[ring];

    const upper =
      ringsData[
      ring + 1
      ];

    for (
      let segment = 0;
      segment < segments;
      segment += 1
    ) {
      const next =
        (
          segment + 1
        ) %
        segments;

      faces.push(
        ...quad(
          lower[segment],
          lower[next],
          upper[next],
          upper[segment],
          SURFACE.CHURCH_DOME,
        ),
      );
    }
  }

  const apex =
    vertex(
      centerX,
      centerY,
      baseZ + height,
    );

  const topRing =
    ringsData[
    ringsData.length - 1
    ];

  for (
    let segment = 0;
    segment < segments;
    segment += 1
  ) {
    const next =
      (
        segment + 1
      ) %
      segments;

    faces.push(
      triangle(
        topRing[segment],
        topRing[next],
        apex,
        SURFACE.CHURCH_DOME,
      ),
    );
  }

  return faces;
};

const cross = (
  x,
  y,
  bottomZ,
  height,
) => {
  const thickness =
    0.09;

  const vertical =
    box(
      x - thickness,
      y - thickness,
      x + thickness,
      y + thickness,
      bottomZ,
      bottomZ + height,
      SURFACE.CROSS,
    );

  const armZ =
    bottomZ +
    height * 0.68;

  const horizontal =
    box(
      x - height * 0.25,
      y - thickness,
      x + height * 0.25,
      y + thickness,
      armZ - thickness,
      armZ + thickness,
      SURFACE.CROSS,
    );

  return [
    ...vertical,
    ...horizontal,
  ];
};

const churchMesh = () => {
  const mesh = [];

  // nave
  mesh.push(
    ...box(
      31,
      19,
      42,
      35,
      0,
      4.9,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...gableRoofX(
      30.7,
      18.7,
      42.3,
      35.3,
      4.9,
      6.4,
      SURFACE.CHURCH_ROOF,
    ),
  );

  // transept
  mesh.push(
    ...box(
      27,
      23,
      46,
      30,
      0,
      4.2,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...gableRoofY(
      26.7,
      22.7,
      46.3,
      30.3,
      4.2,
      4.85,
      SURFACE.CHURCH_ROOF,
    ),
  );

  // bell tower
  mesh.push(
    ...box(
      33.5,
      15,
      39.5,
      20.5,
      0,
      7.1,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...pyramidRoof(
      33.2,
      14.7,
      39.8,
      20.8,
      7.1,
      9,
      SURFACE.CHURCH_ROOF,
    ),
  );

  mesh.push(
    ...cross(
      36.5,
      17.75,
      8.9,
      1.45,
    ),
  );

  // rear apse mass
  mesh.push(
    ...box(
      34,
      33,
      39,
      38,
      0,
      3.8,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...pyramidRoof(
      33.8,
      32.8,
      39.2,
      38.2,
      3.8,
      4.8,
      SURFACE.CHURCH_ROOF,
    ),
  );

  // central drum
  mesh.push(
    ...box(
      33.8,
      24,
      39.2,
      29.4,
      5.2,
      6.1,
      MATERIAL.CHURCH,
    ),
  );

  // onion/domed center
  mesh.push(
    ...dome(
      36.5,
      26.7,
      6.1,
      2.85,
      2.7,
      12,
      4,
    ),
  );

  mesh.push(
    ...cross(
      36.5,
      26.7,
      8.7,
      1.25,
    ),
  );

  return mesh;
};

const libraryMesh = () => {
  const mesh = [];

  mesh.push(
    ...box(
      49,
      37,
      68,
      54,
      0,
      4.7,
      MATERIAL.LIBRARY,
    ),
  );

  mesh.push(
    ...gableRoofX(
      48.7,
      36.7,
      68.3,
      54.3,
      4.7,
      5.65,
      SURFACE.LIBRARY_ROOF,
    ),
  );

  // entrance projection
  mesh.push(
    ...box(
      48.2,
      43,
      50.5,
      48,
      0,
      3.2,
      MATERIAL.LIBRARY,
    ),
  );

  mesh.push(
    ...pyramidRoof(
      48,
      42.8,
      50.7,
      48.2,
      3.2,
      3.75,
      SURFACE.LIBRARY_ROOF,
    ),
  );

  return mesh;
};

const house = ({
  x1,
  y1,
  x2,
  y2,
  height,
  material,
  ridge,
}) => {
  const mesh = [
    ...box(
      x1,
      y1,
      x2,
      y2,
      0,
      height,
      material,
    ),
  ];

  const overhang =
    0.25;

  const roof =
    ridge === "x"
      ? gableRoofX(
        x1 - overhang,
        y1 - overhang,
        x2 + overhang,
        y2 + overhang,
        height,
        height + 1.4,
        SURFACE.HOUSE_ROOF,
      )
      : gableRoofY(
        x1 - overhang,
        y1 - overhang,
        x2 + overhang,
        y2 + overhang,
        height,
        height + 1.4,
        SURFACE.HOUSE_ROOF,
      );

  mesh.push(
    ...roof,
  );

  return mesh;
};

const oldDistrictMesh = () => [
  ...house({
    x1: 5,
    y1: 35,
    x2: 13,
    y2: 43,
    height: 4.2,
    material: MATERIAL.PLASTER,
    ridge: "x",
  }),

  ...house({
    x1: 16,
    y1: 34,
    x2: 26,
    y2: 43,
    height: 5.4,
    material: MATERIAL.BRICK,
    ridge: "y",
  }),

  ...house({
    x1: 4,
    y1: 47,
    x2: 15,
    y2: 57,
    height: 3.7,
    material: MATERIAL.PLASTER,
    ridge: "x",
  }),

  ...house({
    x1: 17,
    y1: 46,
    x2: 26,
    y2: 58,
    height: 4.8,
    material: MATERIAL.BRICK,
    ridge: "y",
  }),
];

export const BUILDING_MESH =
  Object.freeze([
    ...churchMesh(),
    ...libraryMesh(),
    ...oldDistrictMesh(),
  ]);
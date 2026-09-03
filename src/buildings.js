import {
  quad,
  triangle,
  vertex,
} from "./geometry.js";

export const SURFACE = Object.freeze({
  CHURCH_ROOF: "church-roof",
  CHURCH_DOME: "church-dome",
  HOUSE_ROOF: "house-roof",
  LIBRARY_ROOF: "library-roof",
  CROSS: "cross",
  CHURCH_DRUM: "church",
});

const solidBox = (
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

  const top =
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
        top[segment],
        top[next],
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
    0.08;

  const armZ =
    bottomZ +
    height * 0.68;

  return [
    ...solidBox(
      x - thickness,
      y - thickness,
      x + thickness,
      y + thickness,
      bottomZ,
      bottomZ + height,
      SURFACE.CROSS,
    ),

    ...solidBox(
      x - height * 0.25,
      y - thickness,
      x + height * 0.25,
      y + thickness,
      armZ - thickness,
      armZ + thickness,
      SURFACE.CROSS,
    ),
  ];
};

const churchMesh = () => [
  ...gableRoofX(
    30.88,
    17.88,
    42.12,
    36.12,
    5.2,
    6.6,
    SURFACE.CHURCH_ROOF,
  ),

  ...gableRoofY(
    26.88,
    22.88,
    31.12,
    31.12,
    4.4,
    5.2,
    SURFACE.CHURCH_ROOF,
  ),

  ...gableRoofY(
    41.88,
    22.88,
    46.12,
    31.12,
    4.4,
    5.2,
    SURFACE.CHURCH_ROOF,
  ),

  ...pyramidRoof(
    32.88,
    14.88,
    40.12,
    20.12,
    7.5,
    9.15,
    SURFACE.CHURCH_ROOF,
  ),

  ...cross(
    36.5,
    17.5,
    9.1,
    1.35,
  ),

  ...pyramidRoof(
    33.88,
    32.88,
    39.12,
    38.12,
    3.8,
    4.8,
    SURFACE.CHURCH_ROOF,
  ),

  ...solidBox(
    34.3,
    24.8,
    38.7,
    29.2,
    6.62,
    7.25,
    SURFACE.CHURCH_DRUM,
  ),

  ...dome(
    36.5,
    27,
    7.25,
    2.15,
    2.15,
  ),

  ...cross(
    36.5,
    27,
    9.32,
    1.15,
  ),
];

const libraryMesh = () => [
  ...gableRoofX(
    48.88,
    36.88,
    68.12,
    54.12,
    4.8,
    5.85,
    SURFACE.LIBRARY_ROOF,
  ),
];

const houseRoof = ({
  x1,
  y1,
  x2,
  y2,
  height,
  ridge,
}) => {
  const overhang =
    0.12;

  return ridge === "x"
    ? gableRoofX(
        x1 - overhang,
        y1 - overhang,
        x2 + overhang,
        y2 + overhang,
        height,
        height + 1.35,
        SURFACE.HOUSE_ROOF,
      )
    : gableRoofY(
        x1 - overhang,
        y1 - overhang,
        x2 + overhang,
        y2 + overhang,
        height,
        height + 1.35,
        SURFACE.HOUSE_ROOF,
      );
};

const oldDistrictMesh = () => [
  ...houseRoof({
    x1: 5,
    y1: 35,
    x2: 13,
    y2: 43,
    height: 4.2,
    ridge: "x",
  }),

  ...houseRoof({
    x1: 16,
    y1: 34,
    x2: 26,
    y2: 43,
    height: 5.4,
    ridge: "y",
  }),

  ...houseRoof({
    x1: 4,
    y1: 47,
    x2: 15,
    y2: 57,
    height: 3.7,
    ridge: "x",
  }),

  ...houseRoof({
    x1: 17,
    y1: 46,
    x2: 26,
    y2: 58,
    height: 4.8,
    ridge: "y",
  }),
];

export const BUILDING_MESH =
  Object.freeze([
    ...churchMesh(),
    ...libraryMesh(),
    ...oldDistrictMesh(),
  ]);

const churchMesh = () => {
  const mesh = [];

  // main nave
  mesh.push(
    ...box(
      31.2,
      20,
      41.8,
      34,
      0,
      4.9,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...gableRoofX(
      31.02,
      19.82,
      41.98,
      34.18,
      4.9,
      6.45,
      SURFACE.CHURCH_ROOF,
    ),
  );

  // left chapel
  mesh.push(
    ...box(
      27.4,
      23.4,
      31.2,
      29.6,
      0,
      3.9,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...gableRoofY(
      27.28,
      23.28,
      31.32,
      29.72,
      3.9,
      4.7,
      SURFACE.CHURCH_ROOF,
    ),
  );

  // right chapel
  mesh.push(
    ...box(
      41.8,
      23.4,
      45.6,
      29.6,
      0,
      3.9,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...gableRoofY(
      41.68,
      23.28,
      45.72,
      29.72,
      3.9,
      4.7,
      SURFACE.CHURCH_ROOF,
    ),
  );

  // bell tower
  mesh.push(
    ...box(
      33.6,
      15.2,
      39.4,
      20.1,
      0,
      7.1,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...pyramidRoof(
      33.46,
      15.06,
      39.54,
      20.24,
      7.1,
      8.95,
      SURFACE.CHURCH_ROOF,
    ),
  );

  mesh.push(
    ...cross(
      36.5,
      17.65,
      8.82,
      1.4,
    ),
  );

  // rear apse
  mesh.push(
    ...box(
      34,
      34,
      39,
      38.2,
      0,
      3.8,
      MATERIAL.CHURCH,
    ),
  );

  mesh.push(
    ...pyramidRoof(
      33.9,
      33.9,
      39.1,
      38.3,
      3.8,
      4.85,
      SURFACE.CHURCH_ROOF,
    ),
  );

  // central drum
  mesh.push(
    ...box(
      34.2,
      24.4,
      38.8,
      29,
      5.2,
      6.1,
      MATERIAL.CHURCH,
    ),
  );

  // central dome
  mesh.push(
    ...dome(
      36.5,
      26.7,
      6.1,
      2.55,
      2.55,
      12,
      4,
    ),
  );

  mesh.push(
    ...cross(
      36.5,
      26.7,
      8.55,
      1.2,
    ),
  );

  return mesh;
};
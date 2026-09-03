import {
  projectVertex,
  worldToCamera,
} from "./geometry.js";

export const projectObject = (
  object,
  player,
  camera,
  columns,
  rows,
  cellAspect,
) => {
  const bottomCamera =
    worldToCamera(
      {
        x: object.x,
        y: object.y,
        z: object.z,
      },
      player,
      camera,
    );

  const topCamera =
    worldToCamera(
      {
        x: object.x,
        y: object.y,
        z:
          object.z +
          object.height,
      },
      player,
      camera,
    );

  if (
    bottomCamera.z <= 0.05 ||
    topCamera.z <= 0.05
  ) {
    return null;
  }

  const bottom =
    projectVertex(
      bottomCamera,
      columns,
      rows,
      cellAspect,
    );

  const top =
    projectVertex(
      topCamera,
      columns,
      rows,
      cellAspect,
    );

  if (!bottom || !top) {
    return null;
  }

  const focalX =
    columns /
    (
      2 *
      Math.tan(
        Math.PI / 6,
      )
    );

  return {
    distance:
      bottomCamera.z,

    correctedDistance:
      bottomCamera.z,

    centerX:
      bottom.x,

    top:
      top.y,

    bottom:
      bottom.y,

    screenWidth:
      (
        object.width /
        bottomCamera.z
      ) *
      focalX,

    screenHeight:
      bottom.y -
      top.y,
  };
};

export const projectShapePoint = (
  projection,
  x,
  y,
) => ({
  x:
    projection.centerX +
    x *
    projection.screenWidth,

  y:
    projection.bottom -
    y *
    projection.screenHeight,
});
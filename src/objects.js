export const OBJECT_TYPE = Object.freeze({
  GRAVE: "grave",
  ICON: "icon",
});

const line = (x1, y1, x2, y2, glyph = "#") => ({
  x1,
  y1,
  x2,
  y2,
  glyph,
});

const graveShapes = {
  ikari: [
    line(0, 0, 0, 1, "│"),
    line(-0.22, 0.72, 0.22, 0.72, "─"),
    line(-0.34, 0, 0, 0.18, "/"),
    line(0, 0.18, 0.34, 0, "\\"),
    line(-0.34, 0, 0.34, 0, "_"),
  ],

  eudaemonia: [
    line(-0.38, 0, -0.38, 0.72, "│"),
    line(0.38, 0, 0.38, 0.72, "│"),
    line(-0.38, 0, 0.38, 0, "_"),
    line(-0.38, 0.72, -0.2, 0.94, "/"),
    line(-0.2, 0.94, 0.2, 0.94, "─"),
    line(0.2, 0.94, 0.38, 0.72, "\\"),
  ],

  reverence: [
    line(0, 0, 0, 1, "│"),
    line(-0.32, 0.68, 0.32, 0.68, "─"),
    line(-0.5, 0, 0.5, 0, "_"),
    line(-0.42, 0.12, 0.42, 0.12, "─"),
  ],

  serenity: [
    line(-0.4, 0, -0.4, 0.62, "│"),
    line(0.4, 0, 0.4, 0.62, "│"),
    line(-0.4, 0, 0.4, 0, "_"),
    line(-0.4, 0.62, 0, 1, "/"),
    line(0, 1, 0.4, 0.62, "\\"),
  ],

  voryalis: [
    line(0, 0.28, 0, 1, "│"),
    line(-0.24, 0.72, 0.24, 0.72, "─"),
    line(-0.34, 0.18, -0.34, 0.5, "│"),
    line(0.34, 0.18, 0.34, 0.5, "│"),
    line(-0.34, 0.5, 0.34, 0.5, "─"),
    line(-0.34, 0.18, 0, 0, "/"),
    line(0, 0, 0.34, 0.18, "\\"),
  ],
};

const iconFrame = (symbol) => [
  line(-0.5, 0, 0.5, 0, "─"),
  line(-0.5, 1, 0.5, 1, "─"),
  line(-0.5, 0, -0.5, 1, "│"),
  line(0.5, 0, 0.5, 1, "│"),
  line(0, 0.2, 0, 0.8, symbol),
  line(-0.18, 0.6, 0.18, 0.6, symbol),
];

const graves = [
  {
    id: "grave-ikari",
    type: OBJECT_TYPE.GRAVE,
    x: 23.5,
    y: 5.5,
    z: 0,
    width: 1.1,
    height: 1.5,
    label: "ikari",
    shape: graveShapes.ikari,
  },
  {
    id: "grave-eudaemonia",
    type: OBJECT_TYPE.GRAVE,
    x: 29.5,
    y: 5.5,
    z: 0,
    width: 1.25,
    height: 1.25,
    label: "eudaemonia",
    shape: graveShapes.eudaemonia,
  },
  {
    id: "grave-reverence",
    type: OBJECT_TYPE.GRAVE,
    x: 35.5,
    y: 5.5,
    z: 0,
    width: 1.3,
    height: 1.55,
    label: "reverence",
    shape: graveShapes.reverence,
  },
  {
    id: "grave-serenity",
    type: OBJECT_TYPE.GRAVE,
    x: 41.5,
    y: 5.5,
    z: 0,
    width: 1.2,
    height: 1.35,
    label: "serenity",
    shape: graveShapes.serenity,
  },
  {
    id: "grave-voryalis",
    type: OBJECT_TYPE.GRAVE,
    x: 47.5,
    y: 5.5,
    z: 0,
    width: 1.25,
    height: 1.6,
    label: "voryalis",
    shape: graveShapes.voryalis,
  },
];

const icons = [
  ["christ", 30.5, "christ pantocrator", "†"],
  ["theotokos", 32.5, "the theotokos", "·"],
  ["michael", 34.5, "archangel michael", "/"],
  ["mark", 36.5, "saint mark the evangelist", "m"],
  ["peter", 38.5, "saint peter the apostle", "p"],
  [
    "olga",
    40.5,
    "holy equal-to-the-apostles grand princess olga of kyiv",
    "o",
  ],
  ["trinity", 42.5, "the holy trinity", "△"],
].map(([id, x, label, symbol]) => ({
  id: `icon-${id}`,
  type: OBJECT_TYPE.ICON,
  x,
  y: 23.72,
  z: 1.1,
  width: 0.75,
  height: 1.05,
  label,
  shape: iconFrame(symbol),
}));

export const WORLD_OBJECTS = Object.freeze([
  ...graves,
  ...icons,
]);
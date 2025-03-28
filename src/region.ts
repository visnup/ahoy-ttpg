import {
  refCard as _refCard,
  Color,
  GridSnapType,
  ObjectType,
  world,
  type Card,
  type GameObject,
} from "@tabletop-playground/api";

const refCard = _refCard;

refCard.onGrab.add(onGrab);
refCard.onReleased.add(onReleased);
// @ts-expect-error assign
refCard.setup = function () {
  onReleased(this);
};

function onGrab() {
  enableGrid();
  penetrablePieces();
  delayedFreeze(false);
}

function onReleased(region: Card) {
  enableGrid(false);
  for (const obj of world
    .boxTrace(
      region.getPosition(),
      region.getPosition(),
      region.getExtent(false, false),
      region.getRotation(),
    )
    .map((h) => h.object)
    .filter((o) => o.getTemplateName() !== "region"))
    obj.setPosition(obj.getPosition().add([0, 0, 1]));
  penetrablePieces(false);
  if (region.isFaceUp() && region.getStackSize() === 1) {
    delayedFreeze();
    placeWealthDie(region);
    recenterMap();
  }
}

function enableGrid(enabled = true) {
  world.grid.setSnapType(enabled ? GridSnapType.Corners : GridSnapType.None);
}

let freeze: ReturnType<typeof setTimeout>;
function delayedFreeze(enabled = true) {
  clearTimeout(freeze);
  if (enabled) freeze = setTimeout(() => refCard.freeze(), 2000);
}

const onTable = new Map<GameObject, number>();
const impenetrable = new Set(["battle", "board", "fame", "region"]);
function penetrablePieces(penetrable = true) {
  if (penetrable) {
    for (const obj of world.getAllObjects()) {
      if (impenetrable.has(obj.getTemplateName()) || !world.isOnTable(obj))
        continue;
      onTable.set(obj, obj.getObjectType());
      obj.setObjectType(ObjectType.Penetrable);
    }
  } else {
    for (const [obj, type] of onTable) obj.setObjectType(type);
    onTable.clear();
  }
}

const colors = [
  new Color(0x88 / 0xff, 0x4d / 0xff, 0x87 / 0xff, 1),
  new Color(0xff / 0xff, 0xcc / 0xff, 0x08 / 0xff, 1),
  new Color(0xee / 0xff, 0x7e / 0xff, 0x2c / 0xff, 1),
  new Color(0xe3 / 0xff, 0x1f / 0xff, 0x2f / 0xff, 1),
  new Color(0x6c / 0xff, 0xb9 / 0xff, 0x45 / 0xff, 1),
  new Color(0x0c / 0xff, 0xb6 / 0xff, 0xcf / 0xff, 1),
];
function placeWealthDie(region: Card) {
  const hits = world
    .boxTrace(
      region.getPosition(),
      region.getPosition().add([0, 0, 1]),
      region.getExtent(false, false),
      region.getRotation(),
    )
    .filter((h) => h.object.getTemplateName() === "wealth");
  if (hits.length > 0) return;
  const wealth = world.createObjectFromTemplate(
    "618F5B66EB4A60801AF271AA0BDFCCF0",
    region.getPosition().add([0, 0, 1]),
  )!;
  const { pitch, roll } = wealth.getRotation();
  const color = colors[Math.floor((region.getCardDetails(0)?.index ?? 0) / 2)];
  wealth.setPrimaryColor(color);
  wealth.setSecondaryColor(color.contrastingText());
  wealth.setRotation([pitch, region.getRotation().yaw, roll]);
  wealth.snapToGround();
}

function recenterMap() {
  // Find new bounding box center
  const revealed = world
    .getObjectsByTemplateName<Card>("region")
    .filter((r) => r.getStackSize() === 1 && r.isFaceUp());
  const bbox = revealed
    .map((r) => r.getPosition())
    .reduce(
      ([min, max], p) => [
        [Math.min(min[0], p[0]), Math.min(min[1], p[1])],
        [Math.max(max[0], p[0]), Math.max(max[1], p[1])],
      ],
      [
        [Infinity, Infinity],
        [-Infinity, -Infinity],
      ],
    );
  // Calculate offset, rounding to grid snaps
  const delta = [
    (bbox[0][0] + bbox[1][0]) / 2,
    (bbox[0][1] + bbox[1][1]) / 2,
    0,
  ].map((d) => -Math.round(d / 5) * 5) as [number, number, number];
  if (delta.every((d) => d === 0)) return;

  // Shift regions and objects above them
  const seen = new Map<string, number>();
  for (const region of revealed) {
    // Pieces above
    const above = world
      .boxTrace(
        region.getPosition(),
        region.getPosition().add([0, 0, 5]),
        region.getExtent(false, false),
        region.getRotation(),
      )
      .map((h) => h.object)
      .filter((o) => o.getTemplateName() !== "region" && !seen.has(o.getId()));
    for (const obj of above) {
      obj.setPosition(obj.getPosition().add(delta).add([0, 0, 1]), 2);
      seen.set(obj.getId(), obj.getObjectType());
      obj.freeze();
    }
    // Region
    region.setPosition(region.getPosition().add(delta), 2);
    // Unfreeze objects
    for (const obj of above) {
      obj.snapToGround();
      obj.setObjectType(seen.get(obj.getId())!);
    }
  }
}

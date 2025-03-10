import {
  refCard as _refCard,
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
      region.getExtent(true, false),
    )
    .map((h) => h.object)
    .filter((o) => o.getTemplateName() !== "region"))
    obj.setPosition(obj.getPosition().add([0, 0, 1]));
  penetrablePieces(false);
  if (region.isFaceUp() && region.getStackSize() === 1) {
    delayedFreeze();
    placeWealthDie(region);
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
function penetrablePieces(penetrable = true) {
  if (penetrable) {
    for (const obj of world.getAllObjects()) {
      if (
        ["board", "fame"].includes(obj.getTemplateName()) ||
        !world.isOnTable(obj)
      )
        continue;
      onTable.set(obj, obj.getObjectType());
      obj.setObjectType(ObjectType.Penetrable);
    }
  } else {
    for (const [obj, type] of onTable) obj.setObjectType(type);
    onTable.clear();
  }
}

function placeWealthDie(region: GameObject) {
  const hits = world
    .boxTrace(
      region.getPosition(),
      region.getPosition().add([0, 0, 1]),
      region.getExtent(true, false),
    )
    .filter((h) => h.object.getTemplateName() === "wealth");
  if (hits.length > 0) return;
  const wealth = world.createObjectFromTemplate(
    "618F5B66EB4A60801AF271AA0BDFCCF0",
    region.getPosition().add([0, 0, 1]),
  )!;
  const { pitch, roll } = wealth.getRotation();
  wealth.setRotation([pitch, region.getRotation().yaw, roll]);
  wealth.snapToGround();
}

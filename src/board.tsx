import {
  refObject as _refObject,
  refPackageId as _refPackageId,
  Color,
  UIElement,
  Vector,
  world,
  ZonePermission,
  type Card,
  type Dice,
} from "@tabletop-playground/api";
import { jsxInTTPG, render } from "jsx-in-ttpg";
import { players } from "./lib/players";

const refPackageId = _refPackageId;
const refObject = _refObject;

// Market no-stacking zone
const zone =
  world.getZoneById(`cards-${refObject.getId()}`) ??
  world.createZone(refObject.getPosition());
zone.setId(`cards-${refObject.getId()}`);
process.nextTick(() => zone.setRotation(refObject.getRotation()));
zone.setScale([refObject.getSize().x, refObject.getSize().y, 2]);
zone.setStacking(ZonePermission.Nobody);
refObject.onDestroyed.add(() => zone.destroy());

// Orient dice placed on slots
refObject.onSnappedTo.add((obj, player, snap) => {
  if (!snap.getTags().includes("action")) return;
  const { pitch, roll } = obj.getRotation();
  const { yaw } = refObject.getRotation();
  const gimbalLock = Math.abs(Math.abs(pitch) - 90) < 2;
  obj.setRotation([gimbalLock ? pitch + 2 : pitch, yaw, roll]);
});

// Take seat
const ui = new UIElement();
ui.position = new Vector(-18, 0, 0.2);
ui.scale = 0.2;
ui.widget = render(
  <button
    size={48}
    font="Constantia.ttf"
    fontPackage={refPackageId}
    onClick={(button, player) => {
      const origin = new Vector(0, 0, world.getTableHeight());
      const p = Vector.lerp(origin, refObject.getPosition(), 2).add([0, 0, 50]);
      player.setPositionAndRotation(
        p,
        p.findLookAtRotation(Vector.lerp(origin, refObject.getPosition(), 0.5)),
      );
    }}
  >
    {" Sit "}
  </button>,
);
refObject.addUI(ui);

// Collect all faction pieces
// @ts-expect-error assign
refObject.setup = (slot: number) => {
  const p = refObject.getPosition();
  const x = refObject.getRotation().compose([0, 90, 0]).toVector();
  const y = refObject.getRotation().toVector();
  const gold = world.getObjectByTemplateName<Card>("gold")!;

  const player = players.find((p) => p.template === refObject.getTemplateId());
  switch (player?.name) {
    case "bluefin-squadron": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(5, player);
      placeGold();
      const ref = placeDeck(player.reference);
      const two = ref.takeCards(1)!;
      two.setPosition(ref.getPosition().add(x.multiply(7)));
      for (const c of [ref, two]) c.freeze();
      placeShip(player.patrol, [16, 6], 10);
      placeShip(player.stronghold, [23, 6], 3);
      placeDeck(player["1p"], true, [-16, 0]);
      placeFame(0);
      break;
    }
    case "smuggler-red": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(4, player);
      placeGold();
      placeDeck(player.reference, true);
      placeDeck(player.pledge, true, [0, -10]);
      placeReward();
      placeFame(1);
      break;
    }
    case "mollusk-union": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(4, player);
      placeGold();
      const ready = placeDeck(player.comrade, false, [10, 9]).takeCards(6);
      ready?.setPosition(
        refObject
          .getAllSnapPoints()
          .find((s) => s.getTags().includes("comrade"))!
          .getGlobalPosition()
          .add([0, 0, 1]),
      );
      ready?.snap();
      placeShip(player.cutter, [14, 7]);
      placeShip(player.gunship, [18, 7]);
      placeHolder();
      const plans = placeDeck(player.plans);
      plans.shuffle();
      plans.deal(2, [slot], false, true);
      placeFame(2);
      break;
    }
    case "smuggler-white": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(4, player);
      placeGold();
      placeDeck(player.reference, true);
      placeDeck(player.pledge, true, [0, -10]);
      placeReward();
      placeFame(3);
      break;
    }
  }

  function placeShip(id: string, [dx, dy]: [number, number], n = 1) {
    let columns = Math.floor(Math.sqrt(n));
    while (n % columns !== 0) columns--;
    const p0 = p
      .add([0, 0, 2])
      .add(x.multiply(dx))
      .add(y.multiply(dy))
      .add(x.multiply(-columns + 1));
    for (let i = 0; i < n; i++) {
      const ship = world.createObjectFromTemplate(
        id,
        p0
          .add(x.multiply((i % columns) * 2))
          .add(y.multiply(Math.floor(i / columns) * 1.2)),
      )!;
      ship.setRotation(refObject.getRotation());
      ship.snapToGround();
    }
  }

  function placeDice(n: number, { color }: { color: Color }) {
    for (let i = 0; i < n; i++) {
      const dice = world.createObjectFromTemplate(
        "D3AFC9C59445D790B3A437A515B48423",
        p
          .add([0, 0, 2])
          .add(x.multiply(-5 + 2 * i))
          .add(y.multiply(9)),
      ) as Dice;
      dice.setPrimaryColor(color);
      if (color.r + color.g + color.b < 1.5)
        dice.setSecondaryColor([1, 1, 1, 1]);
      dice.setRotation(refObject.getRotation());
      dice.snapToGround();
    }
  }

  function placeGold(n = 1) {
    const piece = gold.takeCards(n);
    piece?.setPosition(p.add([0, 0, 1]).add(x.multiply(7)).add(y.multiply(9)));
    piece?.setRotation(refObject.getRotation());
    piece?.snapToGround();
    return piece;
  }

  function placeDeck(
    id: string,
    flip = false,
    [dx, dy]: [number, number] = [16, 0],
  ) {
    const deck = world.createObjectFromTemplate(
      id,
      p.add([0, 0, 5]).add(x.multiply(dx)).add(y.multiply(dy)),
    ) as Card;
    deck.setRotation(refObject.getRotation());
    deck.snapToGround();
    if (flip) deck.flip();
    return deck;
  }

  function placeReward() {
    const start = refObject
      .getAllSnapPoints()
      .find((s) => s.getTags().includes("reward:start"))!;
    return [new Color(0, 0, 0, 1), new Color(1, 1, 1, 1)].map((color) => {
      const cube = world.createObjectFromTemplate(
        "FF60F606CD4B187A377E00BD275848DF",
        start.getGlobalPosition().add([0, 0, 3]),
      );
      cube?.setPrimaryColor(color);
      cube?.setRotation(refObject.getRotation());
      cube?.snapToGround();
      return cube;
    });
  }

  function placeHolder() {
    const holder = world.createObjectFromTemplate(
      "9F6ECAB494436798F7BFB89CD8FCF795",
      p.add([0, 0, 1]).add(y.multiply(-12)),
    );
    holder?.setRotation(refObject.getRotation());
    holder?.snapToGround();
    holder?.setOwningPlayerSlot(slot);
    return holder;
  }

  function placeFame(i: number) {
    const deck = world.createObjectFromTemplate(
      "4C0CA475A74BBC5A0758C4B94A6563BF",
      p,
    ) as Card;
    const marker = deck.takeCards(1, true, i);
    deck.destroy();
    const fame = world.getObjectByTemplateName("fame")!;
    const start = fame
      .getAllSnapPoints()
      .find((s) => s.getTags().includes("fame:start"))!;
    marker?.setPosition(start.getGlobalPosition().add([0, 0, 5]));
    marker?.setRotation(fame.getRotation());
    marker?.snapToGround();
    return marker;
  }
};

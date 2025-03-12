import {
  refObject as _refObject,
  Color,
  world,
  ZonePermission,
  type Card,
  type Dice,
} from "@tabletop-playground/api";
import { players } from "./lib/players";

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

// Collect all faction pieces
// @ts-expect-error assign
refObject.setup = (slot: number) => {
  const p = refObject.getPosition();
  const x = refObject.getRotation().compose([0, 90, 0]).toVector();
  const y = refObject.getRotation().toVector();
  const gold = world.getObjectByTemplateName<Card>("gold")!;

  const player = players
    .flat()
    .find((p) => p.template === refObject.getTemplateId());
  switch (player?.name) {
    case "coral-cap-pirates": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(4, player);
      placeGold();
      placeDeck(player.jobs, false, [10, 9]).shuffle();
      const left = placeDeck(player.boats, true, [-19, 9]);
      const right = left.takeCards(3)!;
      right.setPosition(left.getPosition().add(x.multiply(38)));
      for (const deck of [left, right])
        for (let j = 0; j < 3; j++) {
          const card = j ? deck.takeCards(1)! : deck;
          card.setPosition(deck.getPosition().add(y.multiply(-j * 8)));
          const suit = card
            .getCardDetails(0)!
            .metadata.trim() as keyof typeof player.frigates;
          process.nextTick(() => {
            placeShip(player.frigates[suit], [
              (deck === left ? -19 : 19) + 4.7,
              11.2 - j * 8,
            ]);
          });
        }
      placeFame(7);
      break;
    }

    case "blackfish-brigade": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(5, player);
      placeGold();
      const ref = placeDeck(player.reference, true);
      const two = ref.takeCards(1, true, 1)!;
      two.setPosition(ref.getPosition().add(x.multiply(7)));
      const three = ref.takeCards(1, true, 1)!;
      three.setPosition(ref.getPosition().add(x.multiply(14)));
      placeDeck(player["whale-pod-tile"], false, [16, 10]).setRotation([
        0, 0, 0,
      ]);
      placeShip(player["whale-pod"], [16, 10], 1)!.setRotation([0, 0, 0]);
      placeShip(player.patrol, [23.2, 6], 10);
      placeShip(player["veteran-patrol"], [30, 6], 3);
      placeDeck(player["1p"], true, [-16, 0]);
      placeFame(4);
      break;
    }

    case "bluefin-squadron": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(5, player);
      placeGold();
      const ref = placeDeck(player.reference, true);
      const two = ref.takeCards(1, true, 1)!;
      two.setPosition(ref.getPosition().add(x.multiply(7)));
      placeShip(player.patrol, [16.2, 6], 10);
      placeShip(player.stronghold, [23, 6], 3);
      placeDeck(player["1p"], true, [-16, 0]);
      placeFame(0);
      break;
    }

    case "leviathan": {
      const tile = placeDeck(player.tile, true, [0, 10.5]);
      const black = [new Color(0, 0, 0)];
      placeReward(black, tile);
      placeReward(black, tile);
      placeShip(player.head, [-9, 14], 4);
      placeShip(player.body, [15.5, 6], 12);
      placeDice(4, player, 15);
      placeGold(1, 15);
      placeHolder();
      const evolution = placeDeck(player.evolution, false, [-16, 0]);
      evolution.shuffle();
      evolution.deal(2, [slot], false, true);
      const appetite = placeDeck(player.appetite, false);
      appetite.shuffle();
      const revealed = appetite.takeCards(1, true, 1)!;
      revealed.setPosition(appetite.getPosition().add(x.multiply(7)));
      revealed.flip();
      placeFame(6);
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
      placeShip(player.cutter, [-14, 7]);
      placeShip(player.gunship, [-18, 7]);
      placeHolder();
      const plans = placeDeck(player.plans, false, [-16, 0]);
      plans.shuffle();
      plans.deal(2, [slot], false, true);
      placeFame(2);
      break;
    }

    case "shellfire-rebellion": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(4, player);
      placeGold();
      const ready = placeDeck(player.comrade, false, [10, 9]).takeCards(2);
      ready?.setPosition(
        refObject
          .getAllSnapPoints()
          .find((s) => s.getTags().includes("comrade"))!
          .getGlobalPosition()
          .add([0, 0, 1]),
      );
      ready?.snap();
      placeDeck(player["launcher-board"], true);
      placeShip(player.range, [16, 6]);
      placeDeck(player.reference, true, [23, 0]);
      placeShip(player.launcher, [23, 6], 3);
      placeHolder();
      const plans = placeDeck(player.plans, false, [-16, 0]);
      plans.shuffle();
      plans.deal(2, [slot], false, true);
      placeFame(5);
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
    let ship, w, h;
    for (let i = 0; i < n; i++) {
      ship = world.createObjectFromTemplate(
        id,
        p0
          .add(x.multiply((i % columns) * (w ?? 2.2)))
          .add(y.multiply(Math.floor(i / columns) * (h ?? 1.2))),
      )!;
      ship.setOwningPlayerSlot(slot);
      if (!w) {
        const { x, y } = ship.getSize();
        w = y + 0.2;
        h = x + 0.2;
      }
      ship.setRotation(refObject.getRotation());
      ship.snapToGround();
    }
    return ship;
  }

  function placeDice(n: number, { color }: { color: Color }, dy = 9) {
    for (let i = 0; i < n; i++) {
      const dice = world.createObjectFromTemplate(
        "D3AFC9C59445D790B3A437A515B48423",
        p
          .add([0, 0, 2])
          .add(x.multiply(-5 + 2 * i))
          .add(y.multiply(dy)),
      ) as Dice;
      dice.setPrimaryColor(color);
      dice.setSecondaryColor(color.contrastingText());
      dice.setRotation(refObject.getRotation());
      dice.snapToGround();
    }
  }

  function placeGold(n = 1, dy = 9) {
    const piece = gold.takeCards(n);
    piece?.setPosition(p.add([0, 0, 1]).add(x.multiply(7)).add(y.multiply(dy)));
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
    deck.setOwningPlayerSlot(slot);
    deck.setRotation(refObject.getRotation());
    deck.snapToGround();
    if (flip) deck.flip();
    return deck;
  }

  function placeReward(
    colors = [new Color(0, 0, 0, 1), new Color(1, 1, 1, 1)],
    board = refObject,
  ) {
    const start = board
      .getAllSnapPoints()
      .find(
        (s) => s.getTags().includes("reward:start") && !s.getSnappedObject(),
      )!;
    return colors.map((color) => {
      const cube = world.createObjectFromTemplate(
        "FF60F606CD4B187A377E00BD275848DF",
        start.getGlobalPosition().add([0, 0, 3]),
      );
      cube?.setPrimaryColor(color);
      cube?.setRotation(board.getRotation());
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

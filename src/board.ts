import type { Card, Color, Dice } from "@tabletop-playground/api";
import { refObject as _refObject, world } from "@tabletop-playground/api";
import { players } from "./lib/players";

const refObject = _refObject;

// @ts-expect-error assign
refObject.setup = () => {
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
      placeShip(player.patrol, [16, 6]); // x10
      placeShip(player.stronghold, [23, 6]); // x3
      placeDeck(player["1p"], true, [-16, 0]);
      break;
    }
    case "smuggler-red": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(4, player);
      placeGold();
      placeDeck(player.reference, true);
      placeDeck(player.pledge, true, [0, -10]);
      // cubes
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
      placeDeck(player.plans).shuffle();
      placeShip(player.cutter, [14, 7]);
      placeShip(player.gunship, [18, 7]);
      // hand
      break;
    }
    case "smuggler-white": {
      placeShip(player.flagship, [-9, 9]);
      placeDice(4, player);
      placeGold();
      placeDeck(player.reference, true);
      placeDeck(player.pledge, true, [0, -10]);
      // cubes
      break;
    }
  }

  function placeShip(id: string, [dx, dy]: [number, number]) {
    const ship = world.createObjectFromTemplate(
      id,
      p.add([0, 0, 1]).add(x.multiply(dx)).add(y.multiply(dy)),
    )!;
    ship.setRotation(refObject.getRotation());
    ship.snapToGround();
    return ship;
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
};

import type { Card, Color, Dice } from "@tabletop-playground/api";
import { refObject as _refObject, world } from "@tabletop-playground/api";
import { players } from "./lib/players";

const refObject = _refObject;

// @ts-expect-error assign
refObject.setup = () => {
  const p = refObject.getPosition();
  const x = refObject.getRotation().compose([0, 90, 0]).toVector();
  const y = refObject.getRotation().toVector();

  const player = players.find((p) => p.template === refObject.getTemplateId());
  switch (player?.name) {
    case "bluefin-squadron": {
      // patrols, strongholds, reference
      placeFlagship(player);
      placeDice(5, player);
      const ref = placeDeck(player.reference);
      ref.takeCards(1)?.setPosition(ref.getPosition().add(x.multiply(7)));
      break;
    }
    case "smuggler-red": {
      // pledges, reference
      placeFlagship(player);
      placeDice(4, player);
      placeDeck(player.reference, true);
      break;
    }
    case "mollusk-union": {
      // comrades, plans, cutter, gunship
      placeFlagship(player);
      placeDice(4, player);
      const plans = placeDeck(player.plans);
      plans.shuffle();
      break;
    }
    case "smuggler-white": {
      // pledges, reference
      placeFlagship(player);
      placeDice(4, player);
      placeDeck(player.reference, true);
      break;
    }
  }

  function placeFlagship({ flagship: id }: { flagship: string }) {
    const flagship = world.createObjectFromTemplate(
      id,
      p.add([0, 0, 5]).add(x.multiply(-9)).add(y.multiply(9)),
    )!;
    flagship.setRotation(refObject.getRotation());
    flagship.snapToGround();
    return flagship;
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

  function placeDeck(id: string, flip = false) {
    const deck = world.createObjectFromTemplate(
      id,
      p.add([0, 0, 2]).add(x.multiply(16)),
    ) as Card;
    deck.setRotation(refObject.getRotation());
    deck.snapToGround();
    if (flip) deck.flipOrUpright();
    return deck;
  }
};

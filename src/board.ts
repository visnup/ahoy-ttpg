import type { Card, Dice } from "@tabletop-playground/api";
import { refObject as _refObject, world } from "@tabletop-playground/api";

const refObject = _refObject;

// @ts-expect-error assign
refObject.setup = (slot: number) => {
  const p = refObject.getPosition();
  const x = refObject.getRotation().compose([0, 90, 0]).toVector();
  const y = refObject.getRotation().toVector();

  switch (refObject.getTemplateId()) {
    // bluefin squadron
    case "300F62A0D44DB4F40DA0E4A328CB3758": {
      // patrols, strongholds, reference
      placeFlagship("631F8E03FB488C23D1AC3C8270C61C8F");
      placeDice(5, slot);
      placeDeck("94030539784BE6D3AC575BA051EEC8A5", true);
      break;
    }
    // red smuggler
    case "7A8D72AAA64A2A976DCE2A9602C41680": {
      // pledges, reference
      placeFlagship("D1FCC096FA45847655DE3B80A7EBDE39");
      placeDice(4, slot);
      placeDeck("1CD8066C924EBADB2C83F8AEA898CB5B", true);
      break;
    }
    // mollusk union
    case "19F163665B477FC3B87512BEC2175203": {
      // comrades, plans, cutter, gunship
      placeFlagship("05DB99C4744C67CF023531A1AACE80A4");
      placeDice(4, slot);
      const plans = placeDeck("2D101611F44D50794ACA05B19F8C7F11");
      plans.shuffle();
      break;
    }
    // white smuggler
    case "B0DF59A6A844E2CBF4DF44BE8BE35692": {
      // pledges, reference
      placeFlagship("23D464F20A40E3DA7AC80D9A80A38A20");
      placeDice(4, slot);
      placeDeck("7BA03F3582432D846DCC009803B41BE3", true);
      break;
    }
  }

  function placeFlagship(id: string) {
    const flagship = world.createObjectFromTemplate(
      id,
      p.add([0, 0, 5]).add(x.multiply(-9)).add(y.multiply(9)),
    )!;
    flagship.setRotation(refObject.getRotation());
    flagship.snapToGround();
    return flagship;
  }

  function placeDice(n: number, slot: number) {
    const color = world.getSlotColor(slot);
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

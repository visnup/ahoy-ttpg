import type { Button, GameObject } from "@tabletop-playground/api";
import {
  refPackageId as _refPackageId,
  Card,
  Color,
  Dice,
  UIElement,
  Vector,
  world,
} from "@tabletop-playground/api";
import { jsxInTTPG, render } from "jsx-in-ttpg";

const refPackageId = _refPackageId;
const origin = new Vector(0, 0, world.getTableHeight() + 0.5);

type Position = {
  template: string;
  back?: string;
  color?: Color;
  board?: GameObject;
  removable?: true;
};
const positions: Position[] = [
  {
    back: "80BAFE47F441F064D5A344AEE62E71E6", // bluefin squadron
    template: "300F62A0D44DB4F40DA0E4A328CB3758",
    color: new Color(0.0824, 0.1569, 0.298, 1),
  },
  {
    back: "87F8C9518F4700BB8DAB9CADE119C764", // red smuggler
    template: "7A8D72AAA64A2A976DCE2A9602C41680",
    color: new Color(0.9176, 0.0392, 0.1647, 1),
    removable: true,
  },
  {
    back: "60466AB1544E5C552EA642AAAE2453E3", // mollusk union
    template: "19F163665B477FC3B87512BEC2175203",
    color: new Color(0.9804, 0.8039, 0.0039, 1),
  },
  {
    template: "CD0D5A8D07430CD26FD983914F484812", // fame
  },
  {
    back: "B9279E8BED4C4A7C660D50BAEC63FC22", // white smuggler
    template: "B0DF59A6A844E2CBF4DF44BE8BE35692",
    color: new Color(1, 1, 1, 1),
    removable: true,
  },
];

export function initialSetup() {
  const { x, y } = world.getAllTables()[0].getSize();
  const r = Math.max(x, y) / 2 - 20;

  // Boards
  for (const [i, position] of positions.entries()) {
    const a = (i * 2 * Math.PI) / positions.length + Math.PI;
    const p = origin.add([r * Math.cos(a), r * Math.sin(a), 0]);
    const board = (position.board ??= world.createObjectFromTemplate(
      position.back ?? position.template,
      p,
    )!);
    board.setPosition(p);
    board.setRotation([
      0,
      (i * 360) / positions.length + ("color" in position ? 0 : 180),
      0,
    ]);
    board.snapToGround();

    if (!("color" in position) && board.getUIs().length === 0) {
      const ui = new UIElement();
      ui.position = new Vector(-8.1, 0, 0.4);
      ui.scale = 0.2;
      ui.widget = render(
        <button
          size={48}
          font="Constantia.ttf"
          fontPackage={refPackageId}
          onClick={setupPieces}
        >
          {" Setup "}
        </button>,
      );
      board.addUI(ui);
    }
  }

  // Slot colors
  const colors = positions.filter((p) => p.color).map((p) => p.color!);
  for (const [i, c] of colors.entries()) world.setSlotColor(i, c);
  for (let i = colors.length; i < 20; i++) world.setSlotColor(i, [0, 0, 0, 1]);

  // Removable board
  const removable = positions.findLast((p) => p.removable)?.board;
  if (!removable) return;
  const ui = new UIElement();
  ui.position = new Vector(8.1, 0, 0.4);
  ui.scale = 0.2;
  ui.widget = render(
    <button
      size={48}
      font="Constantia.ttf"
      fontPackage={refPackageId}
      onClick={() => {
        positions.splice(
          positions.findIndex((p) => p.board === removable),
          1,
        );
        removable.destroy();
        initialSetup();
      }}
    >
      {" Remove "}
    </button>,
  );
  removable.addUI(ui);
}

function setupPieces(button: Button) {
  const fame = world.getObjectByTemplateName("fame")!;

  // 1. Collect shared pieces
  const shared = [
    ["F5DD8208484E7508A7C1BF8743C9DF8D", 20], // gold
    ["80E8118F324A3F5C2491FFB2447825C4", 25], // damage
    // ["618F5B66EB4A60801AF271AA0BDFCCF0", 11], // wealth
    ["48F9260EAF4C1C73134B17AC44CCD1E0", 2], // damage
  ] as const;
  const x = fame.getRotation().compose([0, 90, 0]).toVector();
  const y = fame.getRotation().toVector();
  const aboveFame = fame
    .getPosition()
    .add([0, 0, 1])
    .add(x.multiply(-6))
    .add(y.multiply(10));
  for (const [i, [id, n]] of shared.entries()) {
    const p = aboveFame.add(x.multiply((i * 12) / (shared.length - 1)));
    const obj = world.createObjectFromTemplate(id, p)!;
    obj.setRotation(fame.getRotation());
    obj.snapToGround();
    if (obj instanceof Card) {
      for (let j = 1; j < n; j++)
        obj.addCards(world.createObjectFromTemplate(id, p) as Card);
    } else if (obj instanceof Dice) {
      for (let j = 1; j < n; j++) {
        const obj = world.createObjectFromTemplate(id, p.add([0, 0, j * 2]))!;
        obj.setRotation(fame.getRotation());
        obj.snapToGround();
      }
    }
  }

  // 4. Prepare region stack
  const regions = world.createObjectFromTemplate(
    "59DF467DB944A6DB31BDC9BE446B910B",
    fame.getPosition().add([0, 0, 1]).add(x.multiply(18)),
  ) as Card;
  regions.setRotation(fame.getRotation());
  regions.snapToGround();
  regions.shuffle();
  regions.takeCards(1)?.destroy();

  // 5. Set up map
  const map = regions.takeCards(2)!;
  map.setPosition(origin);
  map.snapToGround();
  process.nextTick(() => map.flipOrUpright());
  setTimeout(() => {
    const w = map.getSize().x / 2;
    const two = map.takeCards(1)!;
    map.setPosition(origin.add(x.multiply(w + 1e-2)).add(y.multiply(w / 2)));
    map.setRotation(two.getRotation().compose([0, -90, 0]));
    two.setPosition(origin.add(x.multiply(-w - 1e-2)).add(y.multiply(-w / 2)));
    two.setRotation(two.getRotation().compose([0, 90, 0]));
    for (const o of [map, two]) {
      o.snapToGround();
      o.freeze();
    }
  }, 1000);

  // 6. Place wealth dice

  // 7. Prepare market
  const market = world.createObjectFromTemplate(
    "3A02A16FF6431BC7F78FBB874CC30870",
    fame.getPosition().add([0, 0, 1]).add(x.multiply(-16)),
  ) as Card;
  market.setRotation(fame.getRotation());
  market.snapToGround();
  for (let suit = 0; suit < 6; suit++)
    market
      .takeCards(1, false, suit * 4 + Math.floor(Math.random() * 5))
      ?.destroy();
  market.shuffle();

  // 8. Deal market
  const belowFame = fame
    .getPosition()
    .add([0, 0, 1])
    .add(x.multiply(-7))
    .add(y.multiply(-12));
  for (let i = 0; i < 3; i++) {
    const card = market.takeCards(1)!;
    card.setPosition(belowFame.add(x.multiply(i * 7)));
    process.nextTick(() => card.flipOrUpright());
  }

  // 9. Mark fame track

  // Flip boards
  for (const p of positions) {
    if (p.board?.getTemplateId() === p.template) continue;
    const back = p.board!;
    const board = (p.board = world.createObjectFromTemplate(
      p.template,
      back.getPosition(),
    )!);
    board.setRotation(back.getRotation());
    back.destroy();
  }

  // Remove button
  button.getOwningObject()?.removeUI(0);
}

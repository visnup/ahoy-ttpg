import {
  refPackageId as _refPackageId,
  Card,
  Dice,
  GridSnapType,
  UIElement,
  Vector,
  world,
  type Button,
  type Color,
  type GameObject,
} from "@tabletop-playground/api";
import { jsxInTTPG, render } from "jsx-in-ttpg";
import { players } from "./players";

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
  { ...players[0] },
  { ...players[1], removable: true },
  { ...players[2] },
  { template: "CD0D5A8D07430CD26FD983914F484812" }, // fame
  { ...players[3], removable: true },
];
const rotated = (positions: Position[]) => {
  const fame = positions.findIndex((p) => !p.color);
  if (fame <= 0) return positions;
  return [...positions.slice(fame), ...positions.slice(0, fame)];
};

export function initialSetup() {
  const { x, y } = world.getAllTables()[0].getSize();
  const r = Math.max(x, y) / 2 - 20;

  // Boards
  for (const [i, position] of rotated(positions).entries()) {
    const a = (i * 2 * Math.PI) / positions.length;
    const p = origin.add([r * Math.cos(a), r * Math.sin(a), 0]);
    const board = (position.board ??= world.createObjectFromTemplate(
      position.back ?? position.template,
      p,
    )!);
    board.setPosition(p);
    board.setRotation([
      0,
      (i * 360) / positions.length + ("color" in position ? 180 : 0),
      0,
    ]);
    board.snapToGround();

    if (!("color" in position) && board.getUIs().length === 0) {
      const ui = new UIElement();
      ui.position = new Vector(-9.1, 0, 0.4);
      ui.scale = 0.2;
      ui.widget = render(
        <button
          size={96}
          font="Constantia.ttf"
          fontPackage={refPackageId}
          onClick={setup}
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

function setup(button: Button) {
  const fame = world.getObjectByTemplateName("fame")!;

  // 1. Collect shared pieces
  const shared = [
    ["F5DD8208484E7508A7C1BF8743C9DF8D", 1], // gold
    ["80E8118F324A3F5C2491FFB2447825C4", 1], // damage
    // ["618F5B66EB4A60801AF271AA0BDFCCF0", 11], // wealth
    ["48F9260EAF4C1C73134B17AC44CCD1E0", 2], // damage
  ] as const;
  const x = fame.getRotation().compose([0, 90, 0]).toVector();
  const y = fame.getRotation().toVector();
  const aboveFame = fame
    .getPosition()
    .add([0, 0, 5])
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

  // 3. Seat players
  for (const [slot, p] of positions.filter((p) => p.color).entries()) {
    if (p.board?.getTemplateId() === p.template) continue;
    const back = p.board!;
    const board = (p.board = world.createObjectFromTemplate(
      p.template,
      back.getPosition(),
    )!);
    board.setRotation(back.getRotation());
    if ("setup" in board && typeof board.setup === "function")
      board.setup(slot);
    back.destroy();
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
  map.flip();
  process.nextTick(() => {
    const w = map.getSize().x / 2;
    const two = map.takeCards(1)!;
    world.grid.setSnapType(GridSnapType.Corners);
    map.setPosition(origin.add(x.multiply(w)).add(y.multiply(w / 2)));
    map.setRotation(two.getRotation().compose([0, -90, 0]));
    two.setPosition(origin.add(x.multiply(-w)).add(y.multiply(-w / 2)));
    two.setRotation(two.getRotation().compose([0, 90, 0]));
    for (const o of [map, two]) {
      o.snapToGround();
      if ("setup" in o && typeof o.setup === "function") o.setup();
    }
    world.grid.setSnapType(GridSnapType.None);
  });

  // 6. Place wealth dice

  // 7. Prepare market
  const market = world.createObjectFromTemplate(
    "3A02A16FF6431BC7F78FBB874CC30870",
    fame.getPosition().add([0, 0, 1]).add(x.multiply(-16)),
  ) as Card;
  market.setRotation(fame.getRotation());
  market.snapToGround();
  if (positions.length < 5)
    for (let suit = 0; suit < 6; suit++)
      market
        .takeCards(1, false, suit * 4 + Math.floor(Math.random() * 5))
        ?.destroy();
  market.shuffle();

  // 8. Deal market
  const row = fame
    .getAllSnapPoints()
    .filter((s) => s.getTags().includes("market"));
  for (let i = 0; i < 3; i++) {
    const card = market.takeCards(1)!;
    card.setPosition(row[i].getGlobalPosition().add([0, 0, 1]));
    card.snap();
  }

  // 9. Mark fame track

  // Remove button
  button.getOwningObject()?.removeUI(0);
}

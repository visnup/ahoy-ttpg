import {
  refPackageId as _refPackageId,
  Card,
  Dice,
  globalEvents,
  GridSnapType,
  Rotator,
  UIElement,
  Vector,
  world,
  type Color,
  type Player,
} from "@tabletop-playground/api";
import { jsxInTTPG, render } from "jsx-in-ttpg";
import { players } from "./players";

const refPackageId = _refPackageId;
const origin = new Vector(0, 0, world.getTableHeight() + 0.2);

type Position = {
  index: number;
  options: readonly {
    template: string;
    name?: string;
    color?: Color;
  }[];
  board?: Card;
  removable?: true;
};
const positions: Position[] = [
  { options: players[0], index: 0 },
  { options: players[1], index: 0, removable: true },
  { options: players[2], index: 0 },
  { options: [{ template: "CD0D5A8D07430CD26FD983914F484812" }], index: 0 }, // fame
  { options: players[3], index: 0, removable: true },
];
// Rotated so Fame is oriented along the world grid
function rotated(positions: Position[]) {
  const fame = positions.findIndex((p) => !p.options[0].color);
  if (fame <= 0) return positions;
  return [...positions.slice(fame), ...positions.slice(0, fame)];
}
// Boards
function boards(positions: Position[]) {
  return positions.filter((p) => p.options[0].color);
}

function getRadialPosition(i: number, dr = 19) {
  const { x, y } = world.getAllTables()[0].getSize();
  const r = Math.min(x, y) / 2 - dr;
  const a = (i * 2 * Math.PI) / positions.length;
  return origin.add([r * Math.cos(a), r * Math.sin(a), 0]);
}

globalEvents.onPlayerSwitchedSlots.add((player: Player) => {
  const board = boards(positions)[player.getSlot()].board!;
  const p = Vector.lerp(origin, board.getPosition(), 2).add([0, 0, 50]);
  player.setPositionAndRotation(
    p,
    p.findLookAtRotation(Vector.lerp(origin, board.getPosition(), 0.5)),
  );
});

export function initialSetup() {
  // Setup button
  if (!world.getUIs()[0])
    world.addUI(
      Object.assign(new UIElement(), {
        position: origin,
        scale: 0.2,
        widget: render(
          <button
            size={96}
            font="Constantia.ttf"
            fontPackage={refPackageId}
            onClick={setup}
          >
            {" Setup "}
          </button>,
        ),
      }),
    );

  // Reset options if positions got reduced
  if (positions.length < world.getUIs().length)
    while (world.getUIs().length > 1) world.removeUI(1);

  const removable = positions.findLast((p) => p.removable);

  // Boards
  for (const [i, position] of rotated(positions).entries()) {
    const p = getRadialPosition(i);

    // Board
    const option = position.options[position.index];
    const board = (position.board =
      position.board?.getTemplateId() === option.template
        ? position.board
        : (position.board?.destroy?.(),
          world.createObjectFromTemplate(option.template, p) as Card));
    board.setPosition(p);
    board.setRotation([
      0,
      (i * 360) / positions.length + ("color" in option ? 180 : 0),
      0,
    ]);
    board.snapToGround();
    if ("color" in option)
      board.setRotation(
        board
          .getRotation()
          .compose(Rotator.fromAxisAngle(board.getRotation().toVector(), 180)),
      );

    // Options
    if (!world.getUIs()[i] && "color" in option) {
      world.addUI(
        Object.assign(new UIElement(), {
          position: getRadialPosition(i, 28),
          rotation: new Rotator(0, (i * 360) / positions.length + 180, 0),
          scale: 0.2,
          widget: render(
            <horizontalbox gap={20}>
              {position.options.map((option, i) => (
                <imagebutton
                  src={`players/${option.name}/fame.jpg`}
                  srcPackage={refPackageId}
                  width={150}
                  onClick={() => {
                    position.index = i;
                    initialSetup();
                  }}
                />
              ))}
              {removable === position && (
                <imagebutton
                  src="damage.jpg"
                  srcPackage={refPackageId}
                  width={150}
                  onClick={() => {
                    positions.splice(positions.indexOf(removable), 1);
                    removable.board?.destroy();
                    initialSetup();
                  }}
                />
              )}
            </horizontalbox>,
          ),
        }),
      );
    }
  }

  // Slot colors
  const colors = boards(positions).map((p) => p.options[p.index].color!);
  for (const [i, c] of colors.entries()) world.setSlotColor(i, c);
  for (let i = colors.length; i < 20; i++) world.setSlotColor(i, [0, 0, 0, 1]);
}

function setup() {
  // Remove buttons
  while (world.getUIs().length > 0) world.removeUI(0);

  const fame = world.getObjectByTemplateName("fame")!;

  // 1. Collect shared pieces
  const shared = [
    ["F5DD8208484E7508A7C1BF8743C9DF8D", 1], // gold
    ["80E8118F324A3F5C2491FFB2447825C4", 1], // damage
    ["48F9260EAF4C1C73134B17AC44CCD1E0", 2], // damage dice
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
  for (const [slot, p] of positions.entries()) {
    if (!p.options[0].color) continue;
    const board = p.board;
    if (!board || !board.isFaceUp()) continue;
    board.flip();
    if ("setup" in board && typeof board.setup === "function")
      board.setup(slot);
  }
  // Sit buttons
  for (const [i, p] of rotated(positions).entries()) {
    if (!p.options[0].color) continue;
    world.addUI(
      Object.assign(new UIElement(), {
        position: getRadialPosition(i, 2.5),
        rotation: new Rotator(0, (i * 360) / positions.length + 180, 0),
        scale: 0.2,
        widget: render(
          <contentbutton
            onClick={(_, player) =>
              player.switchSlot(boards(positions).indexOf(p))
            }
          >
            <border color={p.options[p.index].color}>
              <text
                size={48}
                font="Constantia.ttf"
                fontPackage={refPackageId}
                color={p.options[p.index].color!.foreground()}
              >
                {" Sit "}
              </text>
            </border>
          </contentbutton>,
        ),
      }),
    );
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
}

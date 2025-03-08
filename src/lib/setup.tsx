import type { Button, GameObject } from "@tabletop-playground/api";
import {
  refPackageId as _refPackageId,
  Color,
  UIElement,
  Vector,
  world,
} from "@tabletop-playground/api";
import { jsxInTTPG, render } from "jsx-in-ttpg";

const refPackageId = _refPackageId;
const origin = new Vector(0, 0, world.getTableHeight());

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

    if (!("color" in position)) {
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
  button.getOwningObject()?.removeUI(0);
}

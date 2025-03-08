import type { GameObject } from "@tabletop-playground/api";
import { Color, UIElement, Vector, world } from "@tabletop-playground/api";
import { jsxInTTPG, render } from "jsx-in-ttpg";

const origin = new Vector(0, 0, world.getTableHeight());

type Position = {
  template: string;
  color?: Color;
  board?: GameObject;
  removable?: true;
};
const positions: Position[] = [
  {
    template: "80BAFE47F441F064D5A344AEE62E71E6", // bluefin squadron
    color: new Color(0.0824, 0.1569, 0.298, 1),
  },
  {
    template: "87F8C9518F4700BB8DAB9CADE119C764", // red smuggler
    color: new Color(0.9176, 0.0392, 0.1647, 1),
    removable: true,
  },
  {
    template: "60466AB1544E5C552EA642AAAE2453E3", // mollusk union
    color: new Color(0.9804, 0.8039, 0.0039, 1),
  },
  {
    template: "CD0D5A8D07430CD26FD983914F484812", // fame
  },
  {
    template: "B9279E8BED4C4A7C660D50BAEC63FC22", // white smuggler
    color: new Color(1, 1, 1, 1),
    removable: true,
  },
];

export function initialSetup() {
  const { x, y } = world.getAllTables()[0].getSize();
  const r = Math.max(x, y) / 2 - 20;

  // Boards
  for (const [i, position] of positions.entries()) {
    const a = (i * 2 * Math.PI) / positions.length;
    const p = origin.add([r * Math.cos(a), r * Math.sin(a), 0]);
    const board = (position.board ??= world.createObjectFromTemplate(
      position.template,
      p,
    )!);
    board.setPosition(p);
    board.snapToGround();
    board.setRotation([
      0,
      (i * 360) / positions.length + ("color" in position ? 180 : 0),
      0,
    ]);
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

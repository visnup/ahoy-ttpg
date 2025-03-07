import { Vector, world } from "@tabletop-playground/api";
import { jsxInTTPG } from "jsx-in-ttpg";

const origin = new Vector(0, 0, world.getTableHeight());

if (world.getAllObjects().length === 0) initialSetup();

function initialSetup() {
  const templates = [
    "80BAFE47F441F064D5A344AEE62E71E6", // 1p bluefin
    "87F8C9518F4700BB8DAB9CADE119C764", // 2p red
    "60466AB1544E5C552EA642AAAE2453E3", // 3p mollusk
    "CD0D5A8D07430CD26FD983914F484812", // fame
    "B9279E8BED4C4A7C660D50BAEC63FC22", // 4p white
  ];
  const { x, y } = world.getAllTables()[0].getSize();
  const r = Math.max(x, y) / 2 - 20;
  for (const [i, id] of templates.entries()) {
    const a = (i * 2 * Math.PI) / templates.length;
    const board = world.createObjectFromTemplate(
      id,
      origin.add([r * Math.cos(a), r * Math.sin(a), 0]),
    );
    board?.setRotation(
      board
        .getRotation()
        .compose([0, (i * 360) / templates.length + (i === 3 ? 0 : 180), 0]),
    );
  }
}

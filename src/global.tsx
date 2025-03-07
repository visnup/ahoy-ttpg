import { Color, Vector, world } from "@tabletop-playground/api";

const origin = new Vector(0, 0, world.getTableHeight());

if (world.getAllObjects().length === 0) initialSetup();

function initialSetup() {
  const players = [
    {
      template: "80BAFE47F441F064D5A344AEE62E71E6",
      slot: 0,
      color: new Color(0.0824, 0.1569, 0.298, 1),
    }, // 1p bluefin
    {
      template: "87F8C9518F4700BB8DAB9CADE119C764",
      slot: 1,
      color: new Color(0.9176, 0.0392, 0.1647, 1),
    }, // 2p red
    {
      template: "60466AB1544E5C552EA642AAAE2453E3",
      slot: 2,
      color: new Color(0.9804, 0.8039, 0.0039, 1),
    }, // 3p mollusk
    { template: "CD0D5A8D07430CD26FD983914F484812" }, // fame
    {
      template: "B9279E8BED4C4A7C660D50BAEC63FC22",
      slot: 3,
      color: new Color(1, 1, 1, 1),
    }, // 4p white
  ];
  const { x, y } = world.getAllTables()[0].getSize();
  const r = Math.max(x, y) / 2 - 20;
  for (const [i, player] of players.entries()) {
    if ("slot" in player) world.setSlotColor(player.slot!, player.color!);
    const a = (i * 2 * Math.PI) / players.length;
    const board = world.createObjectFromTemplate(
      player.template,
      origin.add([r * Math.cos(a), r * Math.sin(a), 0]),
    );
    board?.setRotation(
      board
        .getRotation()
        .compose([0, (i * 360) / players.length + (i === 3 ? 0 : 180), 0]),
    );
  }
  for (let i = 4; i < 20; i++) world.setSlotColor(i, [0, 0, 0, 1]);
}

import { Color } from "@tabletop-playground/api";

export const players = [
  {
    name: "bluefin-squadron",
    template: "300F62A0D44DB4F40DA0E4A328CB3758",
    color: new Color(0.0824, 0.1569, 0.298, 1),
    flagship: "631F8E03FB488C23D1AC3C8270C61C8F",
    patrol: "C31FE232614EE2EC6C993698D2D75000",
    stronghold: "3BD41C49A44EA55E73587480D051E34B",
    reference: "94030539784BE6D3AC575BA051EEC8A5",
    "1p": "7EEB28975149DBB01B93DB8D0EEC4B99",
  },
  {
    name: "smuggler-red",
    template: "7A8D72AAA64A2A976DCE2A9602C41680",
    color: new Color(0.9176, 0.0392, 0.1647, 1),
    flagship: "D1FCC096FA45847655DE3B80A7EBDE39",
    pledge: "ADE309D4F44ED3246B096F8AE812964C",
    reference: "1CD8066C924EBADB2C83F8AEA898CB5B",
  },
  {
    name: "mollusk-union",
    template: "19F163665B477FC3B87512BEC2175203",
    color: new Color(0.9804, 0.8039, 0.0039, 1),
    flagship: "05DB99C4744C67CF023531A1AACE80A4",
    cutter: "ED42917F6B49EFC0115F0AB93E6D84A5",
    gunship: "45295A55E3472E96922E1A8617FD907E",
    comrade: "2B35CBA5134BD90265F177B9637AC524",
    plans: "2D101611F44D50794ACA05B19F8C7F11",
  },
  {
    name: "smuggler-white",
    template: "B0DF59A6A844E2CBF4DF44BE8BE35692",
    color: new Color(1, 1, 1, 1),
    flagship: "23D464F20A40E3DA7AC80D9A80A38A20",
    pledge: "B79971319D4DB8F79132779E2011F5A0",
    reference: "7BA03F3582432D846DCC009803B41BE3",
  },
] as const;

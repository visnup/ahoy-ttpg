import { Color } from "@tabletop-playground/api";

export const players = [
  [
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
      name: "blackfish-brigade",
      template: "A571320FF94B8946841BEEA1709C75D2",
      color: new Color(0.0824, 0.1569, 0.298, 1),
      flagship: "8D635EA1AD49A3F819190E819BDA4506",
      "whale-pod": "634ABB795743EF1E644EC286CC3B07E0",
      "whale-pod-tile": "55424DB91240393F7B31308C77E2464F",
      patrol: "01B2891C164EEF5B2EE43AA727C8C218",
      "veteran-patrol": "C29AA2CEE9443EC6BB65048280A4DBB1",
      reference: "7892FF27F64A28436245EDA65181B4A9",
      "1p": "7EEB28975149DBB01B93DB8D0EEC4B99",
    },
  ],
  [
    {
      name: "smuggler-red",
      template: "7A8D72AAA64A2A976DCE2A9602C41680",
      color: new Color(0.9176, 0.0392, 0.1647, 1),
      flagship: "D1FCC096FA45847655DE3B80A7EBDE39",
      pledge: "ADE309D4F44ED3246B096F8AE812964C",
      reference: "1CD8066C924EBADB2C83F8AEA898CB5B",
    },
  ],
  [
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
      name: "shellfire-rebellion",
      template: "6167FC50250F95B72E76C1413C3B9482",
      color: new Color(0.9804, 0.8039, 0.0039, 1),
      flagship: "7F42FD5287AA96FA6F216F1186DE8CEB",
      launcher: "F1707B1D4518B8281331B6C5A4D1964D",
      "launcher-board": "FDD99B7E8540B15EE3FA69375061B3B4",
      range: "416563BE80463730423814AC631474AB",
      comrade: "3C4329B7959CBB08BCDF8CFCE2ACE85B",
      plans: "E922AB6F7C28D8ABBE044F7EC686F772",
      reference: "D1E470FB285DCE83F84DC73DD80FEC91",
    },
  ],
  [
    {
      name: "smuggler-white",
      template: "B0DF59A6A844E2CBF4DF44BE8BE35692",
      color: new Color(1, 1, 1, 1),
      flagship: "23D464F20A40E3DA7AC80D9A80A38A20",
      pledge: "B79971319D4DB8F79132779E2011F5A0",
      reference: "7BA03F3582432D846DCC009803B41BE3",
    },
  ],
] as const;

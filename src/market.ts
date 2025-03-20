import { refCard as _refCard, world } from "@tabletop-playground/api";

const refCard = _refCard;

if (refCard.getStackSize() === 1) {
  refCard.onReleased.add((card) => {
    // Look for a board under the card
    const pc = card.getPosition();
    const below = world.boxTrace(
      pc,
      pc.add([0, 0, -5]),
      card.getExtent(false, false),
      card.getRotation(),
    );
    const board = below.find(
      (h) => h.object.getTemplateName() === "board",
    )?.object;
    if (!board) return;

    const dz = card.getSize().z;

    // Pick the board and everything on it up slightly
    const lift = 1;
    const pb = board.getPosition();
    const above = new Map(
      world
        .boxTrace(
          pb.add([0, 0, -0.3]),
          pb.add([0, 0, lift]),
          board.getExtent(false, true),
          board.getRotation(),
        )
        .filter((h) => h.object !== card)
        .map((h) => [h.object, h.object.getObjectType()]),
    );
    for (const [obj] of above) {
      obj.setPosition(obj.getPosition().add([0, 0, lift]), 1);
      obj.freeze();
    }

    // Tuck the card under
    card.setPosition([pc.x, pc.y, board.getPosition().z - lift / 2]);
    card.snapToGround();

    // Put the board and everything back down
    setTimeout(() => {
      for (const [obj, type] of above) {
        obj.setPosition(obj.getPosition().add([0, 0, -lift + dz]), 1);
        obj.setObjectType(type);
      }
    }, 200);
  });
}

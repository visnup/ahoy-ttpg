import {
  refCard as _refCard,
  ObjectType,
  world,
} from "@tabletop-playground/api";

const refCard = _refCard;

if (refCard.getStackSize() === 1) {
  refCard.onGrab.add((card) => card.setObjectType(ObjectType.Regular));
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

    // Pick the board and everything on it up slightly
    const lift = 1;
    const pb = board.getPosition();
    const above = world
      .boxTrace(
        pb,
        pb.add([0, 0, lift]),
        board.getExtent(false, false),
        board.getRotation(),
      )
      .filter((h) => h.object.getTemplateName() !== "market");
    for (const { object } of above) {
      console.log(object.getId(), object.getTemplateName());
      object.setPosition(object.getPosition().add([0, 0, lift]));
    }

    // Tuck the card under
    card.setPosition([pc.x, pc.y, board.getPosition().z - lift / 2]);
    card.setObjectType(ObjectType.Penetrable);
    card.snapToGround();

    // Put the board and everything back down
    for (const { object } of above)
      object.setPosition(object.getPosition().add([0, 0, -lift]));
  });
}

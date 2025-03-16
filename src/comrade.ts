import {
  refCard as _refCard,
  world,
  type Card,
} from "@tabletop-playground/api";

const refCard = _refCard;

// Tuck comrades under launchers
refCard.onReleased.add((card) => {
  // Look for a launcher under the card
  const pc = card.getPosition();
  const below = world.boxTrace(
    pc.add([0, 0, -0.1]),
    pc.add([0, 0, -5]),
    card.getExtent(false, false),
    card.getRotation(),
  );
  const launcher = below.find(
    (h) => h.object.getTemplateName() === "launcher",
  )?.object;
  if (!launcher) return;
  const comrades = below.find(
    (h) => h.object.getTemplateName() === "comrade" && h.object !== card,
  )?.object;

  // Pick the launcher up
  const lift = card.getSize().z * 3;
  const pl = launcher.getPosition();
  launcher.setPosition(pl.add([0, 0, lift]));

  // Tuck the comrade under
  if (comrades) {
    (comrades as Card).addCards(card);
  } else {
    card.setPosition([pl.x, pl.y, launcher.getPosition().z - lift / 2]);
    card.snapToGround();
  }

  // Put the launcher back down
  launcher.snap();
});

// Stack comrades under launchers
refCard.onInserted.add((card, inserted) => {
  // Look for a launcher above the stack
  const pc = card.getPosition();
  const above = world.boxTrace(
    pc,
    pc.add([0, 0, 5]),
    card.getExtent(false, false),
    card.getRotation(),
  );
  const launcher = above.find(
    (h) => h.object.getTemplateName() === "launcher",
  )?.object;
  if (!launcher) return;

  // Pick the launcher up
  const lift = inserted.getSize().z * 3;
  const pl = launcher.getPosition();
  launcher.setPosition(pl.add([0, 0, lift]));

  // Put the launcher back down
  launcher.snap();
});

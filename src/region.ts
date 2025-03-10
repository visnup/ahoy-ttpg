import type { Card } from "@tabletop-playground/api";
import { refCard as _refCard, world } from "@tabletop-playground/api";

const refCard = _refCard;

refCard.onReleased.add(setup);

function setup(region: Card) {
  // Check if face down or die is already placed
  if (!region.isFaceUp()) return;
  const hits = world
    .boxTrace(
      region.getPosition(),
      region.getPosition().add([0, 0, 1]),
      region.getExtent(true, false),
    )
    .filter((h) => h.object.getTemplateName() === "wealth");
  if (hits.length > 0) return;

  // Place wealth die
  const wealth = world.createObjectFromTemplate(
    "618F5B66EB4A60801AF271AA0BDFCCF0",
    region.getPosition().add([0, 0, 1]),
  )!;
  const { pitch, roll } = wealth.getRotation();
  wealth.setRotation([pitch, region.getRotation().yaw, roll]);
  wealth.snapToGround();
}

// @ts-expect-error assign
refCard.setup = function () {
  setup(this);
};

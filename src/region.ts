import type { Card } from "@tabletop-playground/api";
import {
  refCard as _refCard,
  GridSnapType,
  world,
} from "@tabletop-playground/api";

const refCard = _refCard;

refCard.onGrab.add(enableGrid);
refCard.onReleased.add(setup);

let freeze: ReturnType<typeof setTimeout>;

function enableGrid() {
  world.grid.setSnapType(GridSnapType.Corners);
  clearTimeout(freeze);
}

function setup(region: Card) {
  world.grid.setSnapType(GridSnapType.None);

  // Check if stacked or face down
  if (!region.isFaceUp() || region.getStackSize() > 1) return;

  // Freeze after a delay
  clearTimeout(freeze);
  freeze = setTimeout(() => {
    region.freeze();
  }, 5000);

  // Check if wealth die is already placed
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

import { refObject, world, type Vector } from "@tabletop-playground/api";

let previous: Vector | undefined;
let follower: typeof refObject | undefined;
refObject.onGrab.add((obj) => {
  // If the white reward cube is grabbed
  if (obj.getPrimaryColor().r > 0.5) {
    // Record previous position
    previous = obj.getPosition();
    // Find the follower
    follower = undefined;
    for (const { object } of world.lineTrace(
      obj.getPosition(),
      obj.getPosition().add([0, 0, -5]),
    )) {
      if (object.getTemplateName() === "reward" && object !== obj)
        break; // Bail if we're above the other reward cube
      else if (object.getTemplateName() === "board") {
        for (const p of object.getAllSnapPoints()) {
          const o = p.getSnappedObject();
          if (o && o !== obj && o.getTemplateName() === "reward") {
            follower = o;
            break;
          }
        }
        break;
      }
    }
  }
});

refObject.onSnapped.add((obj) => {
  // Move the follower to the previous position
  if (previous && follower && obj.getPosition().distance(previous) > 0.5)
    follower.setPosition(previous, 1);
  previous = follower = undefined;
});

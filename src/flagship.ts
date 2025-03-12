import {
  refObject as _refObject,
  Rotator,
  Vector,
  world,
  type Card,
  type GameObject,
} from "@tabletop-playground/api";

const refObject = _refObject;

refObject.onHit.add((ship, other) => {
  if (
    ship.getOwningPlayerSlot() === 0 &&
    other &&
    other.getTemplateName() === "region" &&
    !ship.getSavedData("setup")
  ) {
    setupBlue(ship, other);
    setupYellow(
      world
        .getObjectsByTemplateName<Card>("region")
        .find(
          (o) => o !== other && o.getStackSize() === 1 && world.isOnTable(o),
        )!,
    );
    ship.setSavedData(other.getId(), "setup");
  }
});

function circling(piece: GameObject, region: GameObject) {
  const out = piece.getPosition().subtract(region.getPosition()).unit();
  const { pitch, roll } = piece.getRotation();
  return new Rotator(pitch, out.toRotator().yaw, roll);
}

function setupBlue(ship: GameObject, region: GameObject) {
  const direction = circling(ship, region);
  ship.setRotation(direction);
  placePatrol(placements(ship, region)[0], direction);
  if (ship.getTemplateMetadata() === "blackfish-brigade") placeWhalePod(region);
}
function placePatrol(p: Vector, r: Rotator) {
  const patrol = world
    .getObjectsByTemplateName("patrol")
    .filter((o) => world.isOnTable(o))
    .sort(
      (a, b) => a.getPosition().distance(p) - b.getPosition().distance(p),
    )[0];
  patrol.setPosition(p.add([0, 0, 1]));
  patrol.snapToGround();
  patrol.setRotation(r);
  return patrol;
}
function placeWhalePod(region: GameObject) {
  const pod = world.getObjectByTemplateName("whale-pod")!;
  pod.setPosition(region.getPosition().add([0, 0, 1]));
  pod.snapToGround();
}

function setupYellow(region: GameObject) {
  // Find island quadrant
  const size = region.getExtent(true, false).getMaxElement();
  const rotation = region.getRotation();
  const sp = region
    .getPosition()
    .add(rotation.getRightVector().multiply(-size * 0.7))
    .add(rotation.getForwardVector().multiply(-size * 0.8));
  // Place flagship
  const flagship = world
    .getObjectsByTemplateName("flagship")
    .find((o) =>
      ["mollusk-union", "shellfire-rebellion"].includes(
        o.getTemplateMetadata(),
      ),
    )!;
  flagship.setPosition(sp.add([0, 0, 1]));
  const direction = circling(flagship, region);
  flagship.setRotation(direction);
  flagship.snapToGround();
  // Place comrades from supply
  const places = placements(flagship, region);
  placeComrades(places[0]);
  if (flagship.getTemplateMetadata() === "shellfire-rebellion") {
    placeComrades(places[1]);
    placeLauncher(places[0], direction);
  }
}
function placeComrades(p: Vector) {
  const comrades = world
    .getObjectsByTemplateName<Card>("comrade")
    .find((o) => world.isOnTable(o))!
    .takeCards(2)!;
  comrades.setPosition(p.add([0, 0, 1]));
  comrades.snapToGround();
}
function placeLauncher(p: Vector, r: Rotator) {
  const launcher = world
    .getObjectsByTemplateName("launcher")
    .find((o) => world.isOnTable(o))!;
  launcher.setPosition(p.add([0, 0, 1]));
  launcher.setRotation(r);
  launcher.snap();
}

// Find viable placements for more pieces
function placements(ship: GameObject, region: GameObject) {
  // Find the occupied quadrant; assume we're rotated on the world's coordinates
  const p = region.getPosition();
  const sp = ship.getPosition();
  const [x, y] = [...sp.subtract(p)].map(Math.sign);
  const size = region.getExtent(true, false).getMaxElement();

  // Sort the quadrant's corners by distance from ship
  const corners = [
    p,
    p.add([size * x, 0, 0]),
    p.add([size * x, size * y, 0]),
    p.add([0, size * y, 0]),
  ].sort((a, b) => b.distance(sp) - a.distance(sp));
  // Interpolate midpoints between ship and corners
  return corners.map((corner, i) => Vector.lerp(sp, corner, 0.4 + i * 0.2));
}

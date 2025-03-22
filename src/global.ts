import {
  Card,
  Color,
  GameWorld,
  globalEvents,
  Rotator,
  Vector,
  world,
  type GameObject,
  type Player,
} from "@tabletop-playground/api";
import { initialSetup } from "./lib/setup";

// Configuration
world.setShowDiceRollMessages(false);
world.grid.setWidth(5);
world.grid.setHeight(5);
world.grid.setVerticalOffset(0.5);

// Create initial setup
if (world.getAllObjects().length === 0) initialSetup();

// Hotkey to mimic hot seat functionality
globalEvents.onScriptButtonPressed.add((player: Player, index: number) => {
  const dir = [, -1, 1][index];
  if (dir) {
    const n = world
      .getAllObjects()
      .filter((d) =>
        ["board", "board-back"].includes(d.getTemplateName()),
      ).length;
    player.switchSlot((n + player.getSlot() + dir) % n);
  }
});

// Extend GameWorld
declare module "@tabletop-playground/api" {
  interface GameWorld {
    getObjectsByTemplateName<T = GameObject>(name: string): T[];
    getObjectByTemplateName<T = GameObject>(name: string): T | undefined;
    isOnMap(obj: GameObject): boolean;
    isOnTable(obj: GameObject, templateNames?: string[]): boolean;
  }
}
GameWorld.prototype.getObjectsByTemplateName = function <T>(name: string) {
  return this.getAllObjects().filter(
    (d) => d.getTemplateName() === name,
  ) as T[];
};
GameWorld.prototype.getObjectByTemplateName = function <T>(name: string) {
  return this.getAllObjects().find((d) => d.getTemplateName() === name) as T;
};

GameWorld.prototype.isOnMap = function (obj: GameObject) {
  return this.lineTrace(
    obj.getPosition(),
    obj.getPosition().add(new Vector(0, 0, -10)),
  ).some(({ object }) => object.getTemplateName() === "region");
};
GameWorld.prototype.isOnTable = function (
  obj: GameObject,
  templateNames: string[] = [],
) {
  return this.lineTrace(
    obj.getPosition(),
    obj.getPosition().add(new Vector(0, 0, -10)),
  ).every(
    ({ object }) =>
      object.getTemplateName() === obj.getTemplateName() ||
      templateNames.includes(object.getTemplateName()),
  );
};

// Extend Card
declare module "@tabletop-playground/api" {
  interface Card {
    flip(): void;
  }
}
Card.prototype.flip = function () {
  this.setRotation(
    this.getRotation().compose(
      Rotator.fromAxisAngle(this.getRotation().toVector(), 180),
    ),
  );
};

// Extend Color
declare module "@tabletop-playground/api" {
  interface Color {
    contrastingText(): Color;
  }
}
Color.prototype.contrastingText = function () {
  return 0.299 * this.r + 0.587 * this.g + 0.114 * this.b < 0.6
    ? new Color(1, 1, 1, 1)
    : new Color(0, 0, 0, 1);
};

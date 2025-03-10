import type { GameObject, Player } from "@tabletop-playground/api";
import {
  Card,
  GameWorld,
  globalEvents,
  Rotator,
  Vector,
  world,
} from "@tabletop-playground/api";
import { initialSetup } from "./lib/setup";

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
  ).some(({ object }) => object.getTemplateName() === "map");
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

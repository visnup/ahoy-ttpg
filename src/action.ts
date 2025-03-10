import { ObjectType, refDice } from "@tabletop-playground/api";

refDice.onPrimaryAction.add((die) => die.setObjectType(ObjectType.Penetrable));
refDice.onMovementStopped.add((die) => die.setObjectType(ObjectType.Regular));

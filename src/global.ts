import { world } from "@tabletop-playground/api";
import { initialSetup } from "./lib/setup";

if (world.getAllObjects().length === 0) initialSetup();

import { Direction } from "@enums";
import { ExpressValidator } from "express-validator";
import { MazeService } from "services";

export const { matchedData, body, param, validationResult } = new ExpressValidator({
  isDirection: async (value: any) => {
    if (Object.values(Direction).includes(value as Direction)) {
      return value as Direction;
    }

    throw new Error("Invalid direction");
  },
  isMaze: async (value: any) => {
    if (await MazeService.mazeExists(value)) {
      return true;
    }

    throw new Error(`Maze '${value}' does not exist.`);
  },
});

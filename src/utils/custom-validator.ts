import { Direction } from "@enums";
import { ExpressValidator } from "express-validator";

export const { matchedData, body, param, validationResult } = new ExpressValidator({
  isDirection: async (value: any) => {
    if (Object.values(Direction).includes(value as Direction)) {
      return value as Direction;
    }

    throw new Error("Invalid direction");
  },
});

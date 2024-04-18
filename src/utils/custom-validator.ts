import { ExpressValidator } from "express-validator";
import { Direction } from "@enums";

export const { matchedData, body, validationResult } = new ExpressValidator({
  isDirection: async (value: any) => {
    if (Object.values(Direction).includes(value as Direction)) {
      return value as Direction;
    }

    throw new Error("Direction is not valid!");
  },
});

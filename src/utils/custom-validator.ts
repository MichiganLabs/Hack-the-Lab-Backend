import { Direction, Environment } from "@enums";
import { ExpressValidator } from "express-validator";

export const { matchedData, body, param, query, validationResult } = new ExpressValidator({
  isDirection: async (value: any) => {
    if (Object.values(Direction).includes(value as Direction)) {
      return value as Direction;
    }

    throw new Error("Invalid direction");
  },
  isEnvironment: async (value: any) => {
    if (Object.values(Environment).includes(value as Environment)) {
      return value as Environment;
    }

    throw new Error("Invalid environment");
  },
});

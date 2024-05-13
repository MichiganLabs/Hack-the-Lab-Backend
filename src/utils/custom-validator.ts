import { Direction, Role } from "@enums";
import { ExpressValidator } from "express-validator";

export const { matchedData, body, param, query, validationResult } = new ExpressValidator({
  isDirection: async (value: any) => {
    if (Object.values(Direction).includes(value as Direction)) {
      return value as Direction;
    }

    throw new Error("Invalid direction");
  },
  isRole: async (value: any) => {
    if (Object.values(Role).includes(value as Role)) {
      return value as Role;
    }

    throw new Error("Invalid role");
  },
});

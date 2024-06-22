import { ExpressValidator } from "express-validator";
import { convertToDirection, convertToEnvironment } from "./converters";

export const { matchedData, body, param, query, validationResult } = new ExpressValidator({
  isDirection: async (value: any) => {
    return convertToDirection(value);
  },
  isEnvironment: async (value: any) => {
    return convertToEnvironment(value);
  },
});

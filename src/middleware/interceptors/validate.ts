import { RequestHandler } from "express";
import { ContextRunner } from "express-validator";
import { asyncHandler, createError } from "utils";
import { validationResult } from "utils/custom-validator";

export const validate = (validations: ContextRunner[]): RequestHandler => {
  return asyncHandler(async (req, _res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, "errors");
    }

    next();
  });
};

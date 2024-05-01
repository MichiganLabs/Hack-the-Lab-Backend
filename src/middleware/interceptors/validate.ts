import { RequestHandler } from "express";
import { ContextRunner } from "express-validator";
import { validationResult } from "utils/custom-validator";

export const validate = (validations: ContextRunner[]): RequestHandler => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({
      errors: errors.array(),
    });
  };
};

import { UserRepository } from "data/repository";
import { asyncHandler, createError } from "utils";

export const authorize = asyncHandler(async (req, _res, next) => {
  const apiKey = req.headers["x-api-key"] as string;

  // No API Key provided, immediately return 401 (UNAUTHORIZED)
  if (apiKey == undefined) {
    throw createError(401, "Unauthorized", "User is unauthorized");
  }

  const userResult = await UserRepository.getUserForKey(apiKey);

  if (0 == userResult.length) {
    throw createError(401, "Unauthorized", "User is unauthorized");
  }

  const user = userResult[0];

  if (user == null || user.disabled) {
    throw createError(401, "Unauthorized", "User is unauthorized");
  }

  req.authenticated = true;
  req.user = user;

  next();
});

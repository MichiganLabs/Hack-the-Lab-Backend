import * as db from "@data";
import { AuthUser } from "hackthelab";
import { asyncHandler, createError } from "utils";

export const authorize = asyncHandler(async (req, _res, next) => {
  const apiKey = req.headers["x-api-key"];

  // No API Key provided, immediately return 401 (UNAUTHORIZED)
  if (apiKey == undefined) {
    throw createError(401, "Unauthorized", "User is unauthorized");
  }

  const rows: AuthUser[] = await db.query("SELECT * FROM users WHERE api_key::text = $1;", [apiKey]);

  if (0 == rows.length) {
    throw createError(401, "Unauthorized", "User is unauthorized");
  }

  const user = rows[0];

  if (user == null || user.disabled) {
    throw createError(401, "Unauthorized", "User is unauthorized");
  }

  req.authenticated = true;
  req.user = user;

  next();
});

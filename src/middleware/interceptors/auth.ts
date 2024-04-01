import { Interceptor } from "express";
import { AuthUser } from "hackthelab";
import * as db from "../../data";

export const authorize: Interceptor = async (req, res, next) => {
  var apiKey = req.headers["x-api-key"];

  // No API Key provided, immediately return 401 (UNAUTHORIZED)
  if (apiKey == undefined) {
    res.sendStatus(401);
    return;
  }

  const rows = await db.query("SELECT * FROM users WHERE api_key::text = $1;", [
    apiKey,
  ]);

  if (0 == rows.length) {
    res.sendStatus(401);
    return;
  }

  let user = rows[0] as unknown as AuthUser;

  if (user.disabled) {
    res.sendStatus(401);
    return;
  }

  req.authenticated = true;
  req.auth = rows[0];

  next();
};

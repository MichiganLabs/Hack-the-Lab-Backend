import * as db from "@data";
import { Interceptor } from "express";
import { AuthUser } from "hackthelab";

export const authorize: Interceptor = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  // No API Key provided, immediately return 401 (UNAUTHORIZED)
  if (apiKey == undefined) {
    res.sendStatus(401);
    return;
  }

  const rows: AuthUser[] = await db.query("SELECT * FROM users WHERE api_key::text = $1;", [apiKey]);

  if (0 == rows.length) {
    res.sendStatus(401);
    return;
  }

  const user = rows[0];

  if (user.disabled) {
    res.sendStatus(401);
    return;
  }

  req.authenticated = true;
  req.user = rows[0];

  next();
};

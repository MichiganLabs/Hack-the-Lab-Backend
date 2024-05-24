import * as db from "@data";
import { Role } from "@enums";
import { AuthUser } from "hackthelab";

export const getUsersOfRole = (role: Role): Promise<AuthUser[]> => {
  return db.query("SELECT * FROM users WHERE role = $1", [role]);
};

export const getUserForKey = (apiKey: string): Promise<AuthUser[]> => {
  return db.query("SELECT * FROM users WHERE api_key::text = $1;", [apiKey]);
};

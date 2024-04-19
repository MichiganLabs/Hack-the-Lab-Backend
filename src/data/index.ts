import { createHash } from "crypto";
import { getQueryCache } from "./cache";
import { pgQuery } from "./db";

export const query = async (text: string, params: any) => {
  const hash = createHash("sha1")
    .update(text + params.toString())
    .digest("hex");

  let result: any;

  // Attempt to find the result in cache first.
  try {
    result = await getQueryCache(hash);

    if (!result) {
      result = pgQuery(text, params, hash);
    }
  } catch {
    // Could not read from cache, query the database.
    result = pgQuery(text, params, hash);
  }

  return result;
};

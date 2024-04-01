import { createHash } from "crypto";
import { getQueryCache } from "./cache";
import { _query } from "./db";

export const query = async (text: string, params: any) => {
  var hash = createHash("sha1")
    .update(text + params.toString())
    .digest("hex");

  var result: any;

  // Attempt to find the result in cache first.
  try {
    result = await getQueryCache(hash);

    if (!result) {
      result = _query(text, params, hash);
    }
  } catch {
    // Could not read from cache, query the database.
    result = _query(text, params, hash);
  }

  return result;
};

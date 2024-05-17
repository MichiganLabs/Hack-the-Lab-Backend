import { createHash } from "crypto";
import cache from "./cache";
import { pgQuery } from "./db";

export const query = async (text: string, params: any) => {
  const hash = createHash("sha1")
    .update(text + params.toString())
    .digest("hex");

  const cacheKey = `postgres:${hash}`;

  let result: any;

  // Attempt to find the result in cache first.
  try {
    result = await cache.getCache(cacheKey);

    if (result) {
      return result;
    }
  } catch (e) {
    console.error(e);
    // Could not read from cache, or expired, query the database.
  }

  result = await pgQuery(text, params);

  // Write new value to cache.
  await cache.setCache(cacheKey, result);

  return result;
};

const { acquireLock, releaseLock } = cache;
export { acquireLock, releaseLock };

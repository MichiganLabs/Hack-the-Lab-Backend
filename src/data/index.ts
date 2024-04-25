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
  } catch {
    // Could not read from cache, or expired, query the database.
  }

  result = await pgQuery(text, params);

  // Write new value to cache.
  await cache.setCache(cacheKey, result);

  return result;
};

const getRatPositionCacheKey = (user_id: number, mazeId: string) => `rat:pos-${user_id}-${mazeId}`;
const getEatenCheeseCacheKey = (user_id: number, mazeId: string) => `cheese:eaten-${user_id}-${mazeId}`;

// Rat position result is not stored in cache on query, but instead on update. (see `saveRatPositionToCache`)
export const getRatPosition = async (user_id: number, mazeId: string): Promise<any> => {
  let cachePosition: any;
  const cacheKey = getRatPositionCacheKey(user_id, mazeId);

  try {
    cachePosition = await cache.getCache(cacheKey);

    if (cachePosition) {
      return cachePosition;
    }
  } catch {
    /* empty */
  }

  // Could not read from cache, or expired, query the database.
  const dbPositionRows = await pgQuery(
    "SELECT position FROM actions WHERE maze_id = $1 AND user_id = $2 ORDER BY time_ts DESC LIMIT 1",
    [mazeId, user_id],
  );

  // TODO: After (https://msljira.atlassian.net/browse/HTL-12) is implemented, this should maybe throw an exception.
  if (0 == dbPositionRows.length) {
    return undefined;
  }

  return dbPositionRows[0].position;
};

// Update the cached value for the rat position.
export const saveRatPositionToCache = async (key: number, mazeId: string, data: any): Promise<void> => {
  const cacheKey = getRatPositionCacheKey(key, mazeId);

  await cache.delCache(cacheKey);
  await cache.setCache(cacheKey, data);
};

// Update the cached value for the eaten cheese.
export const saveEatenCheeseToCache = async (key: number, mazeId: string, data: any): Promise<void> => {
  const cacheKey = getEatenCheeseCacheKey(key, mazeId);

  await cache.delCache(cacheKey);
  await cache.setCache(cacheKey, data);
}

const { acquireLock, releaseLock } = cache;
export { acquireLock, releaseLock };

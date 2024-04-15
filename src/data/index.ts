import { createHash } from "crypto";
import {
  delCache,
  getCache,
  getQueryCache,
  setCache,
  setQueryCache,
} from "./cache";
import { pgQuery } from "./db";

export const query = async (text: string, params: any) => {
  const hash = createHash("sha1")
    .update(text + params.toString())
    .digest("hex");

  let result: any;

  // Attempt to find the result in cache first.
  try {
    result = await getQueryCache(hash);

    if (result) {
      return result;
    }
  } catch {}

  // Could not read from cache, or expired, query the database.
  result = await pgQuery(text, params);

  // Write new value to cache.
  await setQueryCache(hash, result);

  return result;
};

const getRatCacheKey = (user_id: string, mazeId: string) =>
  `rat:pos-${user_id}-${mazeId}`;

// Rat position result is not stored in cache on query, but instead on update.
export const getRatPosition = async (user_id: string, mazeId: string) => {
  var result: any;
  let cacheKey = getRatCacheKey(user_id, mazeId);

  try {
    result = await getCache(cacheKey);

    if (result) {
      return result;
    }
  } catch {}

  // Could not read from cache, or expired, query the database.
  let rs = await pgQuery(
    "SELECT curr FROM moves WHERE maze_id = $1 AND user_id = $2 ORDER BY time_ts DESC LIMIT 1",
    [mazeId, user_id]
  );

  if (0 == rs.length) {
    return undefined;
  }

  console.log(rs[0].curr);

  return rs[0].curr;
};

export const setRatPosition = async (
  key: string,
  mazeId: string,
  data: any
) => {
  let cacheKey = getRatCacheKey(key, mazeId);

  await delCache(cacheKey);
  await setCache(cacheKey, data);
};

export { releaseLock, acquireLock } from "./cache";

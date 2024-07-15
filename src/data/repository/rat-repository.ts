import { ActionType } from "@enums";
import { Coordinate } from "hackthelab";
import cache from "../cache";
import { pgQuery } from "../db";

const getRatPositionCacheKey = (userId: number, mazeId: string) => `rat:pos-${userId}-${mazeId}`;

// Rat position result is not stored in cache on query, but instead on update. (see `saveRatPositionToCache`)
export const getRatPosition = async (userId: number, mazeId: string): Promise<Coordinate> => {
  const cacheKey = getRatPositionCacheKey(userId, mazeId);

  try {
    const cachePosition = await cache.getCache(cacheKey);

    if (cachePosition) {
      return cachePosition as Coordinate;
    }
  } catch (e) {
    console.error(e);
    /* empty */
  }

  // Could not read from cache, or expired, query the database.
  const dbPositionRows = await pgQuery("SELECT position FROM actions WHERE maze_id = $1 AND user_id = $2 ORDER BY time_ts DESC LIMIT 1", [
    mazeId,
    userId,
  ]);

  // TODO: After (https://msljira.atlassian.net/browse/HTL-12) is implemented, this should maybe throw an exception.
  if (0 == dbPositionRows.length) {
    return undefined;
  }

  const position = dbPositionRows[0].position as Coordinate;

  // Clear existing cache since we are starting from scratch
  clearRatPositionCache(userId, mazeId);

  // Save the result to cache so that we don't have to retrieve it again from the DB.
  saveRatPositionToCache(userId, mazeId, position);

  return position;
};

// Update the cached value for the rat position.
export const saveRatPositionToCache = async (userId: number, mazeId: string, data: Coordinate): Promise<void> => {
  const cacheKey = getRatPositionCacheKey(userId, mazeId);
  await cache.setCache(cacheKey, data);
};

export const clearRatPositionCache = async (userId: number, mazeId: string): Promise<void> => {
  const cacheKey = getRatPositionCacheKey(userId, mazeId);
  await cache.delCache(cacheKey);
};

const getGrabbedCheeseCacheKey = (userId: number, mazeId: string) => `cheese:grabbed-${userId}-${mazeId}`;

export const getGrabbedCheese = async (userId: number, mazeId: string): Promise<Coordinate> => {
  const cacheKey = getGrabbedCheeseCacheKey(userId, mazeId);

  try {
    const cacheCheese = await cache.getCache(cacheKey);

    if (cacheCheese) {
      return cacheCheese as Coordinate;
    }
  } catch (e) {
    console.error(e);
    /* empty */
  }

  // Could not read from cache, or expired, query the database.

  const sql = `
  SELECT action_data 
  FROM actions 
  WHERE action_type = $1 
    AND maze_id = $2 
    AND user_id = $3 
    AND success = true 
    AND action_data NOT IN (
      SELECT action_data 
      FROM actions 
      WHERE action_type IN ($4, $5)
        AND maze_id = $2 
        AND user_id = $3
        AND success = true
    ) 
  ORDER BY time_ts DESC 
  LIMIT 1
`;

  const dbGrabRows = await pgQuery(sql, [ActionType.Grab, mazeId, userId, ActionType.Drop, ActionType.Eat]);

  if (0 == dbGrabRows.length) {
    return null;
  }

  const grabbedCheese = dbGrabRows[0].actionData as Coordinate;

  // Clear existing cache since we are starting from scratch
  clearGrabbedCheeseCache(userId, mazeId);

  // Save the result to cache so that we don't have to retrieve it again from the DB.
  saveGrabbedCheeseToCache(userId, mazeId, grabbedCheese);

  return grabbedCheese;
};

export const saveGrabbedCheeseToCache = async (userId: number, mazeId: string, data: Coordinate): Promise<void> => {
  const cacheKey = getGrabbedCheeseCacheKey(userId, mazeId);
  await cache.setCache(cacheKey, data);
};

export const clearGrabbedCheeseCache = async (userId: number, mazeId: string): Promise<void> => {
  const cacheKey = getGrabbedCheeseCacheKey(userId, mazeId);
  await cache.delCache(cacheKey);
};

const getDroppedCheeseCacheKey = (userId: number, mazeId: string) => `cheese:dropped-${userId}-${mazeId}`;

export const getDroppedCheesePositions = async (userId: number, mazeId: string): Promise<Coordinate[]> => {
  const cacheKey = getDroppedCheeseCacheKey(userId, mazeId);

  try {
    const cachePositions = await cache.getCache(cacheKey);

    if (cachePositions) {
      return cachePositions as Coordinate[];
    }
  } catch (e) {
    console.error(e);
    /* empty */
  }

  // Could not read from cache, or expired, query the database.
  const dbDroppedCheeseRows = await pgQuery(
    "SELECT action_data FROM actions WHERE maze_id = $1 AND user_id = $2 AND action_type = $3 AND success = true",
    [mazeId, userId, ActionType.Drop],
  );

  if (0 == dbDroppedCheeseRows.length) {
    return [];
  }

  const positions = dbDroppedCheeseRows.map(row => row.actionData) as Coordinate[];

  // Clear existing cache since we are starting from scratch
  clearDroppedCheeseCache(userId, mazeId);

  // Save the result to cache so that we don't have to retrieve it again from the DB.
  saveDroppedCheeseToCache(userId, mazeId, positions);

  return positions;
};

// Update the cached value for the dropped cheese.
export const saveDroppedCheeseToCache = async (userId: number, mazeId: string, newCoordinates: Coordinate[]): Promise<void> => {
  const cacheKey = getDroppedCheeseCacheKey(userId, mazeId);
  const existingCoordinates = (await cache.getCache(cacheKey)) || [];

  // Combine the existing and new coordinates, and remove any duplicates.
  const combined = [...existingCoordinates, ...newCoordinates].filter(
    (item, index, array) => index === array.findIndex(other => other.x === item.x && other.y === item.y),
  );

  await cache.setCache(cacheKey, combined);
};

export const clearDroppedCheeseCache = async (userId: number, mazeId: string): Promise<void> => {
  const cacheKey = getDroppedCheeseCacheKey(userId, mazeId);
  await cache.delCache(cacheKey);
};

const getEatenCheeseCacheKey = (userId: number, mazeId: string) => `cheese:eaten-${userId}-${mazeId}`;

// Rat position result is not stored in cache on query, but instead on update. (see `saveRatPositionToCache`)
export const getEatenCheesePositions = async (userId: number, mazeId: string): Promise<Coordinate[]> => {
  const cacheKey = getEatenCheeseCacheKey(userId, mazeId);

  try {
    const cachePositions = await cache.getCache(cacheKey);

    if (cachePositions) {
      return cachePositions as Coordinate[];
    }
  } catch (e) {
    console.error(e);
    /* empty */
  }

  // Could not read from cache, or expired, query the database.
  const dbPositionRows = await pgQuery(
    "SELECT position FROM actions WHERE maze_id = $1 AND user_id = $2 AND action_type = $3 AND success = true",
    [mazeId, userId, ActionType.Eat],
  );

  if (0 == dbPositionRows.length) {
    return [];
  }

  const positions = dbPositionRows.map(row => row.position) as Coordinate[];

  // Clear existing cache since we are starting from scratch
  clearEatenCheeseCache(userId, mazeId);

  // Save the result to cache so that we don't have to retrieve it again from the DB.
  saveEatenCheeseToCache(userId, mazeId, positions);

  return positions;
};

// Update the cached value for the eaten cheese.
export const saveEatenCheeseToCache = async (userId: number, mazeId: string, newCoordinates: Coordinate[]): Promise<void> => {
  const cacheKey = getEatenCheeseCacheKey(userId, mazeId);
  const existingCoordinates = (await cache.getCache(cacheKey)) || [];

  const combined = [...existingCoordinates, ...newCoordinates].filter(
    (item, index, array) => index === array.findIndex(other => other.x === item.x && other.y === item.y),
  );

  await cache.setCache(cacheKey, combined);
};

export const clearEatenCheeseCache = async (userId: number, mazeId: string): Promise<void> => {
  const cacheKey = getEatenCheeseCacheKey(userId, mazeId);
  await cache.delCache(cacheKey);
};

const getExitMazeCacheKey = (user_id: number, mazeId: string) => `exit:maze-${user_id}-${mazeId}`;

export const getRatExitedMaze = async (user_id: number, mazeId: string): Promise<boolean> => {
  const cacheKey = getExitMazeCacheKey(user_id, mazeId);

  try {
    const ratExitedMaze = await cache.getCache(cacheKey);

    if (ratExitedMaze !== undefined) {
      return ratExitedMaze as boolean;
    }
  } catch (e) {
    console.error(e);
    /* empty */
  }

  // Could not read from cache, or expired, query the database.
  const dbExitMazeActionSuccess = await pgQuery(
    "SELECT success FROM actions WHERE maze_id = $1 AND user_id = $2 AND action_type = $3 AND success = true",
    [mazeId, user_id, ActionType.Exit],
  );

  // If we had any number of successful exits, then the rat has exited the maze.
  const didRatExitMaze = dbExitMazeActionSuccess.length > 0;

  // Save the result to cache so that we don't have to retrieve it again from the DB.
  saveExitMazeToCache(user_id, mazeId, didRatExitMaze);

  return didRatExitMaze;
};

export const clearExitMazeCache = async (userId: number, mazeId: string): Promise<void> => {
  const cacheKey = getExitMazeCacheKey(userId, mazeId);
  await cache.delCache(cacheKey);
};

// Update the cached value for a rat that has exited a maze.
export const saveExitMazeToCache = async (userId: number, mazeId: string, data: boolean): Promise<void> => {
  const cacheKey = getExitMazeCacheKey(userId, mazeId);
  await cache.setCache(cacheKey, data);
};

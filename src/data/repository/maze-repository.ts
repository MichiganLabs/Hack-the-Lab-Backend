import cache from "data/cache";
import { AdminMaze } from "hackthelab";
import { pgQuery } from "../db";

const mazeListCacheKey = "maze-list";

export const getAll = async (): Promise<AdminMaze[]> => {
  try {
    const mazes = await cache.getCache(mazeListCacheKey);

    if (mazes) {
      return mazes as AdminMaze[];
    }
  } catch {
    /* empty */
  }

  const dbMazes = await pgQuery("SELECT * FROM mazes", []);

  if (0 == dbMazes.length) {
    return [];
  }

  const mazes = dbMazes as AdminMaze[];

  cache.delCache(mazeListCacheKey);
  cache.setCache(mazeListCacheKey, mazes);

  return mazes;
};

export const updateLocked = async (mazeId: string, locked: boolean): Promise<void> => {
  await pgQuery("UPDATE mazes SET locked = $2 WHERE id = $1", [mazeId, locked]);

  cache.delCache(mazeListCacheKey);
};

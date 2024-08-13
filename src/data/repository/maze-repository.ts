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

  // Select all mazes from the database and order them by the maze id. (substring the suffix number and order by it numerically)
  // By default order by id will sort maze1, maze10, maze11, maze2 ... which is not what we want.
  const dbMazes = await pgQuery("SELECT * FROM mazes ORDER BY SUBSTRING(id, '^[^0-9_]*'), (SUBSTRING(id, '[0-9]+'))::INT", []);

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

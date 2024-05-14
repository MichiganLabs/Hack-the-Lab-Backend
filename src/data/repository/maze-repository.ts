import cache from "@data/cache";

const mazeLockKey = (mazeId: string) => `maze-lock:${mazeId}`;

export const isLocked = async (mazeId: string): Promise<boolean> => {
  const lockedValue = await cache.getValue(mazeLockKey(mazeId));
  return lockedValue !== null;
};

export const setLocked = async (mazeId: string, locked: boolean): Promise<void> => {
  const cacheKey = mazeLockKey(mazeId);

  if (locked) {
    await cache.setValue(cacheKey, true);
  } else {
    await cache.delValue(cacheKey);
  }
};

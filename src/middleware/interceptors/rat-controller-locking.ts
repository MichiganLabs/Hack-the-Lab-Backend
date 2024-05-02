import { acquireLock, releaseLock } from "@data";
import { RatActionRequest } from "hackthelab";

export const ratControllerLocking = async (req: RatActionRequest, res, next) => {
  // This lock is used to prevent the rat from acting, in the same maze, while processing this action.
  const ratLock = `lock-rat-${req.user.id}-${req.maze.id}`;

  try {
    await acquireLock(ratLock);
    await next();
  } finally {
    releaseLock(ratLock);
  }
};

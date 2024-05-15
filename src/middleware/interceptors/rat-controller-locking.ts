import { acquireLock, releaseLock } from "@data";
import { RatActionRequest } from "hackthelab";
import onFinished from "on-finished";
import { asyncHandler } from "utils";

export const ratControllerLocking = asyncHandler(async (req, res, next) => {
  const { maze } = req as RatActionRequest;

  // This lock is used to prevent the rat from acting, in the same maze, while processing this action.
  const ratLock = `lock-rat-${req.user.id}-${maze.id}`;

  try {
    await acquireLock(ratLock);
    next();
  } finally {
    onFinished(res, async () => {
      await releaseLock(ratLock);
    });
  }
});

import { ActionType } from "@enums";
import { RatRepository } from "data/repository";
import { MazeRequest, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, createError, rethrowOrCreateError } from "utils";

/**
 *
 * Initialize the maze (if necessary) and inject the rat's current position into the request.
 */
export const preActionMiddleware = asyncHandler(async (req, _res, next) => {
  const { maze } = req as MazeRequest;
  const ratActionRequest = req as RatActionRequest;

  try {
    // Verify that the rat hasn't exited the maze.
    const ratExitedMaze = await RatRepository.getRatExitedMaze(req.user.id, maze.id);
    if (ratExitedMaze) {
      throw createError(403, "Already exited", "Rat has already exited the maze.");
    }

    // Verify that the rat hasn't exceeded the number of actions limit.
    const MOVE_LIMIT_MULTIPLIER = 4;
    const ratNumOfActions = await RatService.getNumOfActions(req.user.id, maze.id);
    const ratMoveLimit = maze.openSquareCount * MOVE_LIMIT_MULTIPLIER;
    // If the rat's action count exceeds the move limit, we return a 403 forbidden response.
    if (ratNumOfActions >= ratMoveLimit) {
      throw createError(403, "Action Limit Exceeded", "Rat has exceeded the action limit!");
    }

    // Get rat's current position
    let position = await RatRepository.getRatPosition(req.user.id, maze.id);

    // If we don't have a position, we need to initialize the maze.
    if (!position) {
      position = maze.start;

      // Insert an action denoting the rat has started the maze.
      await RatService.insertAction(req.user.id, maze.id, ActionType.Start, position, null);
    }

    // Add the rat position to the request
    ratActionRequest.ratPosition = position;

    // Move to the next middleware
    next();
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "Internal server error has occurred");
  }
});

import { getRatExitedMaze, getRatPosition } from "@data";
import { ActionType } from "@enums";
import { RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { insertAction } from "services/rat-service";

/**
 *
 * Initialize the maze (if necessary) and inject the rat's current position into the request.
 */
export const preActionMiddleware = async (req: RatActionRequest, res, next) => {
  try {
    // Verify that the rat hasn't exited the maze.
    const ratExitedMaze = await getRatExitedMaze(req.user.id, req.maze.id);
    if (ratExitedMaze) {
      return res.status(403).json({ message: "Rat has exited the maze!" });
    }

    // Verify that the rat hasn't exceeded the number of moves limit.
    const MOVE_LIMIT_MULTIPLIER = 10;
    const ratNumOfMoves = await RatService.getNumOfMoves(req.user.id, req.maze.id);
    const ratMoveLimit = req.maze.open_square_count * MOVE_LIMIT_MULTIPLIER;
    // If the rat's move count exceeds the move limit, we return a 403 forbidden response.
    if (ratNumOfMoves >= ratMoveLimit) {
      return res.status(403).json({ message: "Rat has exceeded the number of moves limit!" });
    }

    // Get rat's current position
    let position = await getRatPosition(req.user.id, req.maze.id);

    // If we don't have a position, we need to initialize the maze.
    if (!position) {
      position = req.maze.start;

      // Insert an action denoting the rat has started the maze.
      await insertAction(req.user.id, req.maze.id, ActionType.Start, position);
    }

    // Add the rat position to the request
    req.ratPosition = position;

    // Move to the next middleware
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

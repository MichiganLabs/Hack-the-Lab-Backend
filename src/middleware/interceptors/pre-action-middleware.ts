import { getRatExitedMaze, getRatPosition } from "@data";
import { ActionType } from "@enums";
import { RatActionRequest } from "hackthelab";
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

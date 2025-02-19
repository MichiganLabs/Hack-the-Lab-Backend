import { Role } from "@enums";
import console from "console";
import { MazeRequest } from "hackthelab";
import { MazeService, UserService } from "services";
import { asyncHandler, createError, rethrowOrCreateError } from "utils";
import { body, matchedData, param } from "utils/custom-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     MazeRequest:
 *       properties:
 *         mazeId:
 *           type: string
 *           example: oneTurn
 *       required:
 *         - mazeId
 *
 */
export const mazeBodySchema = [body("mazeId").isString().withMessage("'mazeId' must be included in the body of the request.")];

/**
 * @swagger
 * components:
 *   parameters:
 *     MazeRequestPathBase:
 *       in: path
 *       name: mazeId
 *       schema:
 *         type: string
 *         example: oneTurn
 *       required: true
 *
 */
// prettier-ignore
export const mazePathSchema = [
  param("mazeId").isString().withMessage("mazeId must be included in the path of the url request.")
]

export const resolveMaze = asyncHandler(async (req, _res, next) => {
  const mazeRequest = req as MazeRequest;

  const { mazeId } = matchedData(req);

  try {
    const environments = UserService.getEnvironmentsForRequest(req);
    const maze = await MazeService.getMazeById(mazeId);

    const hasAccess = environments.includes(maze?.environment);
    const isLocked = maze?.locked && req.user.role !== Role.Admin;

    // If the maze is undefined, or defined but not the right environment, or locked (and the user is not an Admin)
    if (maze == null || !hasAccess || isLocked) {
      throw createError(404, "Maze Not Found", `Maze '${mazeId}' not found!`);
    }

    // Add the maze object to the request
    mazeRequest.maze = maze;

    // Move to the next middleware
    next();
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", `Error occurred while resolving maze.`);
  }
});
